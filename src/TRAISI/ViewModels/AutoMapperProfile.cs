﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using DAL.Core;
using DAL.Models;
using DAL.Models.Groups;
using DAL.Models.Questions;
using DAL.Models.Surveys;
using Microsoft.AspNetCore.Identity;
using TRAISI.ViewModels.SurveyBuilder;
using TRAISI.ViewModels.SurveyViewer;
using TRAISI.ViewModels.Users;
using TRAISI.ViewModels.Extensions;
using TRAISI.ViewModels.Questions;
using TRAISI.SDK;
using TRAISI.Helpers;

namespace TRAISI.ViewModels
{
	public partial class AutoMapperProfile : Profile
	{
		public AutoMapperProfile()
		{
			CreateMap<ApplicationUser, UserViewModel>()
				.ForMember(d => d.Roles, map => map.Ignore());

			CreateMap<UserViewModel, ApplicationUser>()
				.ForMember(d => d.Roles, map => map.Ignore());

			CreateMap<TraisiUser, UserViewModel>()
				.ForMember(d => d.Roles, map => map.Ignore());

			CreateMap<UserViewModel, TraisiUser>()
				.ForMember(d => d.Roles, map => map.Ignore());

			CreateMap<UserViewModel, SurveyUser>()
				.ForMember(d => d.Roles, map => map.Ignore());

			CreateMap<ApplicationUser, UserEditViewModel>()
				.ForMember(d => d.Roles, map => map.Ignore());

			CreateMap<UserEditViewModel, ApplicationUser>()
				.ForMember(d => d.Roles, map => map.Ignore());

			CreateMap<ApplicationUser, UserPatchViewModel>()
				.ReverseMap();

			CreateMap<ApplicationRole, RoleViewModel>()
				.ForMember(d => d.Permissions, map => map.MapFrom(s => s.Claims))
				.ForMember(d => d.UsersCount, map => map.ResolveUsing(s => s.Users?.Count ?? 0))
				.ReverseMap();
			CreateMap<RoleViewModel, ApplicationRole>();

			CreateMap<IdentityRoleClaim<string>, ClaimViewModel>()
				.ForMember(d => d.Type, map => map.MapFrom(s => s.ClaimType))
				.ForMember(d => d.Value, map => map.MapFrom(s => s.ClaimValue))
				.ReverseMap();

			CreateMap<ApplicationPermission, PermissionViewModel>()
				.ReverseMap();

			CreateMap<IdentityRoleClaim<string>, PermissionViewModel>()
				.ConvertUsing(s =>
					Mapper.Map<PermissionViewModel>(ApplicationPermissions.GetPermissionByValue(s.ClaimValue)));

			CreateMap<Survey, SurveyViewModel>()
				.ReverseMap();

			CreateMap<GroupMember, GroupMemberViewModel>();

			CreateMap<GroupMemberViewModel, GroupMember>()
				.ForMember(d => d.User, map => map.Ignore())
				.ForMember(d => d.UserGroup, map => map.Ignore());

			CreateMap<UserGroup, UserGroupViewModel>()
				.ReverseMap();

			CreateMap<SurveyPermission, SurveyPermissionViewModel>()
				.ReverseMap();

			CreateMap<ApiKeys, ApiKeysViewModel>()
				.ForMember(a => a.GroupId, map => map.MapFrom(s => s.Group.Id))
				.ReverseMap();

			CreateMap<EmailTemplate, EmailTemplateViewModel>()
				.ForMember(a => a.GroupName, map => map.MapFrom(s => s.Group.Name))
				.ReverseMap();

			CreateMap<CodeGeneration, CodeGenerationViewModel>()
				.ReverseMap();

			CreateMap<GroupCodeViewModel, Groupcode>()
				.ForMember(gc => gc.Survey, map => map.Ignore());

			CreateMap<Groupcode, GroupCodeViewModel>()
				.ForMember(gc => gc.SurveyId, map => map.MapFrom(s => s.Survey.Id));

			CreateMap<ShortcodeViewModel, Shortcode>()
				.ForMember(sc => sc.Groupcode, map => map.Ignore())
				.ForMember(sc => sc.Survey, map => map.Ignore());
			//.ForMember (sc => sc.Respondent, map => map.Ignore());

			CreateMap<Shortcode, ShortcodeViewModel>()
				.ForMember(sc => sc.SurveyId, map => map.MapFrom(s => s.Survey.Id));
			//.ForMember(sc => sc.Respondent, map => map.MapFrom(r => r.Respondent.Id));

			CreateMap<QuestionPartView, QuestionPartViewViewModel>()
				.AfterMap((s, svm, opt) =>
				{
					svm.Label = s.Labels.FirstOrDefault(l => l.Language == (string)opt.Items["Language"]).Value;
				});

			CreateMap<SBQuestionPartViewViewModel, QuestionPartView>()
				.ForMember(m => m.SurveyView, map => map.Ignore())
				.ForMember(m => m.RepeatSource, map => map.Ignore());

			CreateMap<SBQuestionPartViewModel, QuestionPart>()
				.ForMember(m => m.QuestionConfigurations, map => map.Ignore())
				.ForMember(m => m.QuestionOptions, map => map.Ignore())
				.ReverseMap();

			CreateMap<QuestionPartView, SBQuestionPartViewViewModel>()
				.ForMember(m => m.ParentViewId, map => map.MapFrom(s => s.ParentView.Id))
				.ForMember(m => m.repeatSourceQuestionName, map => map.ResolveUsing(s =>
				{
					if (s.RepeatSource != null)
					{
						return $"question~{s.RepeatSource.QuestionType}~{s.RepeatSource.Id}";
					}
					else
					{
						return null;
					}
				}))
				.AfterMap((s, svm, opt) =>
				{
					svm.Label = Mapper.Map<QuestionPartViewLabelViewModel>(
						s.Labels.FirstOrDefault(l => l.Language == (string)opt.Items["Language"]));
					svm.QuestionPartViewChildren = svm.QuestionPartViewChildren?.OrderBy(c => c.Order).ToList();
				});

			CreateMap<QuestionConfiguration, QuestionConfigurationValueViewModel>()
				.ReverseMap();

			CreateMap<QuestionOptionLabel, QuestionOptionLabelViewModel>()
				.ReverseMap();

			CreateMap<QuestionOption, QuestionOptionValueViewModel>()
					.AfterMap((s, svm, opt) =>
					{
						svm.OptionLabel = Mapper.Map<QuestionOptionLabelViewModel>(s.QuestionOptionLabels.First(l => l.Language == (string)opt.Items["Language"]));
					});

			CreateMap<QuestionConditional, QuestionConditionalViewModel>()
				.ReverseMap().ForMember(c => c.SourceQuestion, map => map.Ignore()).ForMember(c => c.TargetQuestion, map => map.Ignore());
			CreateMap<QuestionOptionConditional, QuestionOptionConditionalViewModel>().ReverseMap();

			CreateMap<SBSurveyViewViewModel, SurveyView>()
				.ForMember(m => m.TermsAndConditionsLabels, map => map.Ignore())
				.ForMember(m => m.ThankYouPageLabels, map => map.Ignore())
				.ForMember(m => m.WelcomePageLabels, map => map.Ignore());

			CreateMap<QuestionPartView, SBPageStructureViewModel>()
				.AfterMap((s, svm, opt) =>
				{
					var language = (string)opt.Items["Language"];
					if (s.QuestionPart == null)
					{
						svm.Label = s.Labels.FirstOrDefault(l => l.Language == language).Value;
						svm.Type = "part";
						svm.Children = s.QuestionPartViewChildren.OrderBy(q => q.Order).Select(q => q.ToLocalizedModel<SBPageStructureViewModel>(language)).ToList();
					}
					else
					{
						svm.Id = s.QuestionPart.Id.ToString();
						svm.Label = s.QuestionPart.Name;
						svm.Type = "question~" + s.QuestionPart.QuestionType;
						svm.Children = s.QuestionPart.QuestionOptions.Count <= 200 ? s.QuestionPart.QuestionOptions.OrderBy(o => o.Name).ThenBy(o => o.Order).Select(q => q.ToLocalizedModel<SBPageStructureViewModel>(language)).ToList() : null;
					}
				});

			CreateMap<QuestionOption, SBPageStructureViewModel>()
				.ForMember(o => o.Children, map => map.Ignore())
				.AfterMap((s, svm, opt) =>
				{
					svm.Id = s.Id.ToString();
					svm.Type = "option~" + s.Name;
					svm.Label = s.QuestionOptionLabels.FirstOrDefault(l => l.Language == (string)opt.Items["Language"]).Value;
				});

			CreateMap<SurveyView, SBSurveyViewViewModel>()
				.ForMember(vm => vm.SurveyId, map => map.MapFrom(m => m.Survey.Id))
				.ForMember(vm => vm.Pages, map => map.MapFrom(m => m.QuestionPartViews))
				.AfterMap((s, svm, opt) =>
				{
					svm.SurveyCompletionPage = Mapper.Map<ThankYouPageLabelViewModel>(
						s.ThankYouPageLabels.FirstOrDefault(l => l.Language == (string)opt.Items["Language"]));
					svm.TermsAndConditionsPage = Mapper.Map<TermsAndConditionsPageLabelViewModel>(
						s.TermsAndConditionsLabels.FirstOrDefault(l =>
							l.Language == (string)opt.Items["Language"]));
					svm.WelcomePage = Mapper.Map<WelcomePageLabelViewModel>(
						s.WelcomePageLabels.FirstOrDefault(l => l.Language == (string)opt.Items["Language"]));
					svm.ScreeningQuestions = Mapper.Map<ScreeningQuestionsLabelViewModel>(
						s.ScreeningQuestionLabels.FirstOrDefault(l => l.Language == (string)opt.Items["Language"]));
				});

			CreateMap<SBOrderViewModel, QuestionPartView>()
				.ForMember(o => o.Labels, map => map.Ignore())
				.ForMember(o => o.ParentView, map => map.Ignore())
				.ForMember(o => o.QuestionPart, map => map.Ignore())
				.ForMember(o => o.SurveyView, map => map.Ignore())
				.ForMember(o => o.QuestionPartViewChildren, map => map.Ignore());

			CreateMap<SBOrderViewModel, QuestionOption>()
				.ForMember(o => o.Name, map => map.Ignore())
				.ForMember(o => o.QuestionOptionLabels, map => map.Ignore());

			CreateMap<QuestionPartViewLabelViewModel, QuestionPartViewLabel>()
					.ForMember(w => w.QuestionPartView, map => map.Ignore())
					.ReverseMap();

			CreateMap<WelcomePageLabelViewModel, WelcomePageLabel>()
				.ForMember(w => w.SurveyView, map => map.Ignore())
				.ReverseMap();

			CreateMap<ThankYouPageLabelViewModel, ThankYouPageLabel>()
				.ForMember(w => w.SurveyView, map => map.Ignore())
				.ReverseMap();

			CreateMap<TermsAndConditionsPageLabelViewModel, TermsAndConditionsPageLabel>()
				.ForMember(w => w.SurveyView, map => map.Ignore())
				.ReverseMap();

			CreateMap<ScreeningQuestionsLabelViewModel, ScreeningQuestionsPageLabel>()
			   .ForMember(w => w.SurveyView, map => map.Ignore())
			   .ReverseMap();

			CreateMap<LabelViewModel, Label>()
				.ReverseMap();

			CreateMap<SiteSurveyTemplate, SiteSurveyTemplateViewModel>()
				.ReverseMap();

			CreateMap<QuestionTypeDefinition, SBQuestionTypeDefinitionViewModel>()
				.ForMember(q => q.ResponseType, map => map.ResolveUsing(s => s.ResponseType.ToString()))
				.ReverseMap();

			CreateMap<QuestionConfigurationDefinition, QuestionConfigurationDefinitionViewModel>()
								.ForMember(q => q.ResourceData, map => map.ResolveUsing(s =>
								{

									return ((s.SharedResource == null)
									? ((s.ResourceData == null) ? (null) : (System.Text.Encoding.UTF8.GetString(s.ResourceData)))
									: System.Text.Encoding.UTF8.GetString(QuestionTypeManager.SharedQuestionResources[s.SharedResource].Data));
								}))
				.ReverseMap();

			CreateMap<QuestionOptionDefinition, QuestionOptionDefinitionViewModel>()
				.ReverseMap();

			CreateSurveyViewerAutoMapperProfiles();

			CreateSurveyResponderAutoMapperProfiles();
		}
	}
}