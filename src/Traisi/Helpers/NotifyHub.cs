using System;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Threading;
using Traisi.Data;

namespace Traisi.Helpers
{
    public interface INotifyHub: IClientProxy
    {
        Task SendToAll(string message);
        Task SurveyStatus(int surveyId, bool working);
        Task IndicateSurveyChange(int surveyId);
        Task DownloadUpdate(NotifyHub.DownloadProgress progress);
        Task RefreshBuilderSurvey(NotifyHub.SurveyUpdate update);
    }
    [Authorize]
    public class NotifyHub : Hub<INotifyHub>
    {
        private IUnitOfWork _unitOfWork;

        public NotifyHub(IUnitOfWork unitOfWork)
        {
            this._unitOfWork = unitOfWork;
        }
        public class NotifyMessage
        {
            public string UserName { get; set; }
            public string Message { get; set; }
        }

		public class DownloadProgress
		{
			public string Id { get; set; }
			public double Progress { get; set; }
			public string Url { get; set; }
		}

        public class SurveyUpdate
        {
            public int SurveyId { get; set; }
            public int QuestionPartViewId { get; set; }
            public string UpdateType { get; set; }
        }

        public static readonly object _messagesLock = new object();
        public static List<NotifyMessage> priorMessages = new List<NotifyMessage>();

        public async Task SendToAll(string message)
        {
			NotifyMessage newMessage = new NotifyMessage() { UserName = this.Context.User.Identity.Name, Message = message };
            lock (_messagesLock)
            {
                NotifyHub.priorMessages.Add(newMessage);
            }

            await Clients.All.SendAsync("sendToAll", newMessage);
        }

        public async Task SurveyStatus(int surveyId, bool working)
        {
            if (working)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"Survey-{surveyId}");
            }
            else
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Survey-{surveyId}");
            }
        }

        public async Task IndicateSurveyChange(int surveyId)
        {
            SurveyUpdate update = new SurveyUpdate
            {
                SurveyId = surveyId,
                QuestionPartViewId = 0,
                UpdateType = "All"
            };
            await Clients.OthersInGroup($"Survey-{surveyId}").RefreshBuilderSurvey(update);
        }

        public async Task SendMessageToCaller(string message)
        {
            await Clients.Caller.SendAsync("sendToAll", message);
						
        }

        public void SendPriorMessageToCaller(NotifyMessage message)
        {
            Clients.Caller.SendAsync("sendToAll", message);
        }

        public async Task SendMessageToGroups(string message)
        {
            List<string> groups = new List<string>() { "SignalR Users" };
            await Clients.Groups(groups).SendAsync("ReceiveMessage", message);
        }

        public void GetPriorMessages()
        {
            lock (_messagesLock)
            {
                foreach (var message in priorMessages)
                {
                    this.SendPriorMessageToCaller(message);
                }
            }
        }

        public override async Task OnConnectedAsync()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, Context.User.Identity.Name);
            await base.OnConnectedAsync();
        }

        /*public override async Task OnDisconnectedAsync(Exception exception)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "SignalR Users");
            await base.OnDisconnectedAsync(exception);
        }*/

    }
}
