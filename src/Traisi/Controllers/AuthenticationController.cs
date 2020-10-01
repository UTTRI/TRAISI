using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AspNet.Security.OpenIdConnect.Extensions;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication;
using AspNet.Security.OpenIdConnect.Server;
using OpenIddict.Core;
using AspNet.Security.OpenIdConnect.Primitives;
using Microsoft.Extensions.Options;
using Traisi.Data.Core.Interfaces;
using Traisi.Data.Models;
using AuthenticationService = Traisi.Authorization.AuthenticationService;


// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860


namespace Traisi.Controllers
{
    public class AuthenticationController : Controller
    {
        private readonly IOptions<IdentityOptions> _identityOptions;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly UserManager<ApplicationUser> _userManager;

        private readonly Authorization.AuthenticationService _authenticationService;

        private readonly IAccountManager _accountManager;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="identityOptions"></param>
        /// <param name="signInManager"></param>
        /// <param name="userManager"></param>
        /// <param name="accountManager"></param>
        /// <param name="authenticationService"></param>
        public AuthenticationController(
            IOptions<IdentityOptions> identityOptions,
            SignInManager<ApplicationUser> signInManager,
            UserManager<ApplicationUser> userManager,
            IAccountManager accountManager,
            Authorization.AuthenticationService authenticationService)
        {
            _identityOptions = identityOptions;
            _signInManager = signInManager;
            _userManager = userManager;
            _accountManager = accountManager;
            _authenticationService = authenticationService;
        }


        [HttpPost("~/connect/token")]
        [Produces("application/json")]
        public async Task<IActionResult> Exchange(OpenIdConnectRequest connectRequest)
        {
            if (connectRequest.IsPasswordGrantType()) {
                ApplicationUser user = null;
                if (connectRequest.HasParameter("survey_user")) {
                    user = await this._accountManager.GetSurveyUserByShortcodeAsync(
                        int.Parse(connectRequest.GetParameter("survey_id")?.Value.ToString()),
                         connectRequest.GetParameter("shortcode")?.Value.ToString().Trim());
                }
                else {
                    user = await _userManager.FindByEmailAsync(connectRequest.Username) ?? await _userManager.FindByNameAsync(connectRequest.Username.Trim());
                }
                if (user == null) {
                    return BadRequest(new OpenIdConnectResponse
                    {
                        Error = OpenIdConnectConstants.Errors.InvalidGrant,
                        ErrorDescription = "Please check that your email and password is correct"
                    });
                }

                // Ensure the user is enabled.
                if (!user.IsEnabled) {
                    return BadRequest(new OpenIdConnectResponse
                    {
                        Error = OpenIdConnectConstants.Errors.InvalidGrant,
                        ErrorDescription = "The specified user account is disabled"
                    });
                }


                // Validate the username/password parameters and ensure the account is not locked out.
                var result = await _signInManager.CheckPasswordSignInAsync(user, connectRequest.Password, true);

                // Ensure the user is not already locked out.
                if (result.IsLockedOut) {
                    return BadRequest(new OpenIdConnectResponse
                    {
                        Error = OpenIdConnectConstants.Errors.InvalidGrant,
                        ErrorDescription = "The specified user account has been suspended"
                    });
                }

                // Reject the token request if two-factor authentication has been enabled by the user.
                if (result.RequiresTwoFactor) {
                    return BadRequest(new OpenIdConnectResponse
                    {
                        Error = OpenIdConnectConstants.Errors.InvalidGrant,
                        ErrorDescription = "Invalid login procedure"
                    });
                }

                // Ensure the user is allowed to sign in.
                if (result.IsNotAllowed) {
                    return BadRequest(new OpenIdConnectResponse
                    {
                        Error = OpenIdConnectConstants.Errors.InvalidGrant,
                        ErrorDescription = "The specified user is not allowed to sign in"
                    });
                }

                if (!result.Succeeded) {
                    return BadRequest(new OpenIdConnectResponse
                    {
                        Error = OpenIdConnectConstants.Errors.InvalidGrant,
                        ErrorDescription = "Please check that your email and password is correct"
                    });
                }



                // Create a new authentication ticket.
                var ticket = await this._authenticationService.CreateTicketAsync(connectRequest, user);

                return SignIn(ticket.Principal, ticket.Properties, ticket.AuthenticationScheme);
            }
            else if (connectRequest.IsRefreshTokenGrantType()) {
                // Retrieve the claims principal stored in the refresh token.
                var info = await HttpContext.AuthenticateAsync(OpenIdConnectServerDefaults.AuthenticationScheme);

                // Retrieve the user profile corresponding to the refresh token.
                // Note: if you want to automatically invalidate the refresh token
                // when the user password/roles change, use the following line instead:
                var user = await _signInManager.ValidateSecurityStampAsync(info.Principal);
                //var user = await _userManager.GetUserAsync(info.Principal);
                if (user == null) {
                    return BadRequest(new OpenIdConnectResponse
                    {
                        Error = OpenIdConnectConstants.Errors.InvalidGrant,
                        ErrorDescription = "The refresh token is no longer valid"
                    });
                }

                // Ensure the user is still allowed to sign in.
                if (!await _signInManager.CanSignInAsync(user)) {
                    return BadRequest(new OpenIdConnectResponse
                    {
                        Error = OpenIdConnectConstants.Errors.InvalidGrant,
                        ErrorDescription = "The user is no longer allowed to sign in"
                    });
                }

                // Create a new authentication ticket, but reuse the properties stored
                // in the refresh token, including the scopes originally granted.
                var ticket = await this._authenticationService.CreateTicketAsync(connectRequest, user);

                return SignIn(ticket.Principal, ticket.Properties, ticket.AuthenticationScheme);
            }
            return BadRequest(new OpenIdConnectResponse
            {
                Error = OpenIdConnectConstants.Errors.UnsupportedGrantType,
                ErrorDescription = "The specified grant type is not supported"
            });
        }


    }
}
