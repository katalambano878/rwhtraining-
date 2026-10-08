/**
 * Pre-built email templates with beautiful HTML designs.
 * Each template supports merge variables: {{first_name}}, {{last_name}}, {{email}}, {{amount}}, {{balance}}, {{tier}}, {{cohort_name}}, {{login_url}}
 */

const BRAND_COLOR = "#2563EB";
const BRAND_HOVER = "#1d4ed8";
const GOLD = "#D4AF37";
const DARK_BG = "#0A0A0A";
const APP_URL_PLACEHOLDER = "{{login_url}}";

export function baseLayout(content: string, preheader: string = ""): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Remote Work Hub</title>
  <!--[if mso]>
  <noscript><xml>
    <o:OfficeDocumentSettings>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml></noscript>
  <![endif]-->
  <style>
    /* Reset */
    body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }

    body {
      margin: 0; padding: 0; width: 100% !important; min-width: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f0f4f8; color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .outer-table { width: 100%; background-color: #f0f4f8; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 0; }

    /* Header */
    .header { background: linear-gradient(135deg, ${DARK_BG} 0%, #1a1a2e 100%); padding: 36px 40px 28px; text-align: center; }
    .header-logo { display: inline-block; }
    .header-badge { display: inline-block; width: 44px; height: 44px; background: ${BRAND_COLOR}; border-radius: 14px; text-align: center; line-height: 44px; vertical-align: middle; }
    .header h1 { color: #ffffff; font-size: 19px; font-weight: 800; margin: 0; letter-spacing: -0.3px; display: inline-block; vertical-align: middle; margin-left: 14px; }
    .header-tagline { color: #64748b; font-size: 12px; margin: 10px 0 0; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600; }

    /* Content */
    .content { padding: 44px 40px 36px; }
    .content h2 { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 18px; letter-spacing: -0.5px; line-height: 1.3; }
    .content h3 { font-size: 16px; font-weight: 700; color: #0f172a; margin: 24px 0 12px; }
    .content p { font-size: 15px; line-height: 1.75; color: #475569; margin: 0 0 16px; }
    .content a { color: ${BRAND_COLOR}; }

    /* Buttons */
    .btn {
      display: inline-block; padding: 15px 36px; border-radius: 12px;
      text-decoration: none; font-weight: 700; font-size: 14px; letter-spacing: 0.3px;
      margin: 8px 0; transition: all 0.2s;
    }
    .btn-primary { background: ${BRAND_COLOR}; color: #ffffff !important; }
    .btn-gold { background: linear-gradient(135deg, ${GOLD}, #c9a227); color: #000000 !important; }
    .btn-dark { background: ${DARK_BG}; color: #ffffff !important; }
    .btn-outline { background: transparent; color: ${BRAND_COLOR} !important; border: 2px solid ${BRAND_COLOR}; }

    /* Cards */
    .card {
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px;
      padding: 24px; margin: 24px 0;
    }
    .card-dark { background: linear-gradient(135deg, #0f172a, #1e293b); border-color: #334155; }
    .card-dark p, .card-dark h3, .card-dark span, .card-dark td { color: #e2e8f0 !important; }
    .card-accent { border-left: 4px solid ${BRAND_COLOR}; border-radius: 0 16px 16px 0; }
    .card-warning { border: 2px solid #fbbf24; background: #fffbeb; }
    .card-success { border: 2px solid #34d399; background: #ecfdf5; }
    .card-gradient { background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 50%, #fef3c7 100%); border: none; }

    /* Stats */
    .stat-row { display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #e2e8f0; }
    .stat-row:last-child { border-bottom: none; }
    .stat-label { font-size: 13px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-value { font-size: 14px; color: #0f172a; font-weight: 700; }

    /* Badges */
    .badge { display: inline-block; padding: 5px 14px; border-radius: 8px; font-size: 11px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; }
    .badge-success { background: #ecfdf5; color: #059669; }
    .badge-warning { background: #fffbeb; color: #d97706; }
    .badge-blue { background: #eff6ff; color: ${BRAND_COLOR}; }
    .badge-dark { background: #1e293b; color: #e2e8f0; }

    /* Divider */
    .divider { height: 1px; background: linear-gradient(to right, transparent, #e2e8f0, transparent); margin: 28px 0; }

    /* Credentials box */
    .credentials-box {
      background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px;
      padding: 28px; margin: 24px 0; border: 1px solid #334155;
    }
    .credentials-box .cred-label { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px; }
    .credentials-box .cred-value { font-size: 16px; color: #ffffff; font-weight: 600; font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace; margin: 0 0 16px; word-break: break-all; }
    .credentials-box .cred-value:last-child { margin-bottom: 0; }

    /* Checklist */
    .checklist { margin: 16px 0; padding: 0; list-style: none; }
    .checklist li { padding: 12px 0; font-size: 15px; color: #334155; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 14px; }
    .checklist li:last-child { border-bottom: none; }
    .check-icon { width: 26px; height: 26px; background: #ecfdf5; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #059669; font-size: 14px; flex-shrink: 0; }
    .number-icon { width: 30px; height: 30px; background: ${BRAND_COLOR}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 800; flex-shrink: 0; }

    /* Preheader */
    .preheader { display: none !important; max-height: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #f0f4f8; }

    /* Footer */
    .footer { background: #f8fafc; padding: 36px 40px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { font-size: 12px; color: #94a3b8; margin: 4px 0; line-height: 1.6; }
    .footer a { color: ${BRAND_COLOR}; text-decoration: none; font-weight: 600; }
    .footer-brand { font-size: 13px; font-weight: 800; color: #64748b; letter-spacing: 0.5px; margin-bottom: 8px !important; }
    .footer-links { margin-top: 16px !important; }
    .footer-links a { margin: 0 8px; }

    /* Social links */
    .social-row { margin: 16px 0 8px; }
    .social-icon { display: inline-block; width: 32px; height: 32px; background: #e2e8f0; border-radius: 8px; margin: 0 4px; text-align: center; line-height: 32px; }
    .social-icon:hover { background: ${BRAND_COLOR}; }

    /* Responsive */
    @media only screen and (max-width: 640px) {
      .wrapper { width: 100% !important; }
      .content { padding: 32px 24px 28px !important; }
      .header { padding: 28px 24px 20px !important; }
      .footer { padding: 28px 24px !important; }
      .content h2 { font-size: 22px !important; }
      .btn { padding: 14px 28px !important; font-size: 13px !important; }
      .card { padding: 20px !important; }
      .credentials-box { padding: 20px !important; }
    }
  </style>
</head>
<body>
  <div class="preheader">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table class="outer-table" role="presentation" cellpadding="0" cellspacing="0" width="100%">
    <tr><td align="center" style="padding: 24px 16px;">

      <table class="wrapper" role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">

        <!-- HEADER -->
        <tr>
          <td class="header" style="background: linear-gradient(135deg, ${DARK_BG} 0%, #1a1a2e 100%); padding: 36px 40px 28px; text-align: center;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
              <tr>
                <td style="vertical-align: middle;">
                  <div style="width: 44px; height: 44px; background: ${BRAND_COLOR}; border-radius: 14px; text-align: center; line-height: 44px; display: inline-block;">
                    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjIgMTEuMDhWMTJhMTAgMTAgMCAxIDEtNS45My05LjE0Ii8+PHBvbHlsaW5lIHBvaW50cz0iMjIgNCAx MiAxNC4wMSA5IDExLjAxIi8+PC9zdmc+" alt="" width="20" height="20" style="vertical-align: middle;" />
                  </div>
                </td>
                <td style="vertical-align: middle; padding-left: 14px;">
                  <span style="color: #ffffff; font-size: 19px; font-weight: 800; letter-spacing: -0.3px;">Remote Work Hub</span>
                </td>
              </tr>
            </table>
            <p style="color: #64748b; font-size: 11px; margin: 12px 0 0; letter-spacing: 2px; text-transform: uppercase; font-weight: 600;">Elite Web Development Masterclass</p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td>
            ${content}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td class="footer" style="background: #f8fafc; padding: 36px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p class="footer-brand" style="font-size: 13px; font-weight: 800; color: #64748b; letter-spacing: 0.5px; margin: 0 0 8px;">Remote Work Hub Masterclass</p>
            <p style="font-size: 12px; color: #94a3b8; margin: 4px 0;">Doctor Barns Tech &mdash; Accra, Ghana</p>
            <p class="footer-links" style="font-size: 12px; color: #94a3b8; margin: 16px 0 0;">
              <a href="${APP_URL_PLACEHOLDER}/student" style="color: ${BRAND_COLOR}; text-decoration: none; font-weight: 600;">Student Portal</a>
              <span style="color: #cbd5e1; margin: 0 8px;">&bull;</span>
              <a href="mailto:info@remoteworkhub.org" style="color: ${BRAND_COLOR}; text-decoration: none; font-weight: 600;">Support</a>
              <span style="color: #cbd5e1; margin: 0 8px;">&bull;</span>
              <a href="https://remoteworkhub.org" style="color: ${BRAND_COLOR}; text-decoration: none; font-weight: 600;">Website</a>
            </p>
            <div style="height: 1px; background: #e2e8f0; margin: 20px auto; width: 60%;"></div>
            <p style="font-size: 11px; color: #cbd5e1; margin: 0;">&copy; ${new Date().getFullYear()} Remote Work Hub. All rights reserved.</p>
          </td>
        </tr>

      </table>

    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Wraps any arbitrary HTML content in the branded email layout.
 * Use this when sending custom / ad-hoc messages so they still look beautiful.
 */
export function wrapInLayout(bodyHtml: string, preheader: string = ""): string {
  const content = `<div class="content" style="padding: 44px 40px 36px;">${bodyHtml}</div>`;
  return baseLayout(content, preheader);
}

export const EMAIL_TEMPLATES = {
  welcome: {
    name: "Welcome to the Masterclass",
    subject: "Welcome to the Elite Web Development Masterclass, {{first_name}}!",
    category: "welcome",
    variables: ["first_name", "last_name", "email", "tier", "amount", "login_url"],
    body: baseLayout(`
    <div class="content">
      <div style="text-align: center; margin-bottom: 32px;">
        <span class="badge badge-success" style="display: inline-block; padding: 5px 14px; border-radius: 8px; font-size: 11px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; background: #ecfdf5; color: #059669;">SEAT SECURED</span>
      </div>
      <h2>Welcome to the Masterclass, {{first_name}}!</h2>
      <p>Your payment has been confirmed and your seat in the <strong>2026 Elite Web Development &amp; SaaS Masterclass</strong> is officially secured.</p>
      
      <div class="card" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 style="margin: 0 0 16px; font-size: 13px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px;">Your Enrollment Details</h3>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 14px 0; font-size: 13px; color: #94a3b8; font-weight: 600;">Student</td>
            <td style="padding: 14px 0; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right;">{{first_name}} {{last_name}}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 14px 0; font-size: 13px; color: #94a3b8; font-weight: 600;">Email</td>
            <td style="padding: 14px 0; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right;">{{email}}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 14px 0; font-size: 13px; color: #94a3b8; font-weight: 600;">Tier</td>
            <td style="padding: 14px 0; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right;">{{tier}}% Payment</td>
          </tr>
          <tr>
            <td style="padding: 14px 0; font-size: 13px; color: #94a3b8; font-weight: 600;">Amount Paid</td>
            <td style="padding: 14px 0; font-size: 14px; color: #059669; font-weight: 700; text-align: right;">GHS {{amount}}</td>
          </tr>
        </table>
      </div>

      <h3 style="font-size: 16px; font-weight: 700; margin: 28px 0 16px;">Your Next Steps:</h3>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; width: 42px;">
            <div style="width: 30px; height: 30px; background: ${BRAND_COLOR}; border-radius: 50%; text-align: center; line-height: 30px; color: #fff; font-size: 13px; font-weight: 800;">1</div>
          </td>
          <td style="padding: 12px 0 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 15px; color: #334155;">Log into your <a href="{{login_url}}" style="color: ${BRAND_COLOR}; font-weight: 700;">Student Dashboard</a></td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; width: 42px;">
            <div style="width: 30px; height: 30px; background: ${BRAND_COLOR}; border-radius: 50%; text-align: center; line-height: 30px; color: #fff; font-size: 13px; font-weight: 800;">2</div>
          </td>
          <td style="padding: 12px 0 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 15px; color: #334155;">Download the pre-requisite checklist</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; width: 42px;">
            <div style="width: 30px; height: 30px; background: ${BRAND_COLOR}; border-radius: 50%; text-align: center; line-height: 30px; color: #fff; font-size: 13px; font-weight: 800;">3</div>
          </td>
          <td style="padding: 12px 0 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 15px; color: #334155;">Set up your development environment</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; vertical-align: top; width: 42px;">
            <div style="width: 30px; height: 30px; background: ${BRAND_COLOR}; border-radius: 50%; text-align: center; line-height: 30px; color: #fff; font-size: 13px; font-weight: 800;">4</div>
          </td>
          <td style="padding: 12px 0 12px 14px; font-size: 15px; color: #334155;">Join the Discord community</td>
        </tr>
      </table>

      <div style="text-align: center; margin: 36px 0 16px;">
        <a href="{{login_url}}" class="btn btn-primary" style="display: inline-block; background: ${BRAND_COLOR}; color: #ffffff; padding: 15px 36px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">Access Your Dashboard &rarr;</a>
      </div>
      
      <p style="font-size: 13px; color: #94a3b8; text-align: center;">We start on <strong style="color: #64748b;">October 19, 2026</strong>. Get ready to build something incredible.</p>
    </div>
    `, "Your seat is secured! Welcome to the Elite Web Development Masterclass."),
  },

  credentials: {
    name: "Student Credentials",
    subject: "Your Masterclass Login Credentials",
    category: "onboarding",
    variables: ["first_name", "last_name", "email", "password", "login_url"],
    body: baseLayout(`
    <div class="content">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-radius: 50%; margin: 0 auto 16px; text-align: center; line-height: 64px; font-size: 28px;">&#127881;</div>
        <span class="badge badge-success" style="display: inline-block; padding: 5px 14px; border-radius: 8px; font-size: 11px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; background: #ecfdf5; color: #059669;">ACCOUNT CREATED</span>
      </div>
      <h2 style="text-align: center;">Welcome, {{first_name}}!</h2>
      <p style="text-align: center;">Your payment has been confirmed and your student account is ready. Use the credentials below to log into your dashboard.</p>

      <div class="credentials-box" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 28px; margin: 28px 0; border: 1px solid #334155;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td>
              <p style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px;">Email</p>
              <p style="font-size: 16px; color: #ffffff; font-weight: 600; font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace; margin: 0 0 20px; word-break: break-all;">{{email}}</p>
            </td>
          </tr>
          <tr>
            <td>
              <div style="height: 1px; background: #334155; margin: 0 0 20px;"></div>
            </td>
          </tr>
          <tr>
            <td>
              <p style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px;">Temporary Password</p>
              <p style="font-size: 18px; color: #fbbf24; font-weight: 700; font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace; margin: 0; word-break: break-all; letter-spacing: 1px;">{{password}}</p>
            </td>
          </tr>
        </table>
      </div>

      <div class="card card-warning" style="background: #fffbeb; border: 2px solid #fbbf24; border-radius: 16px; padding: 20px; margin: 24px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="width: 32px; vertical-align: top; padding-top: 2px;">
              <span style="font-size: 20px;">&#9888;&#65039;</span>
            </td>
            <td style="padding-left: 12px;">
              <p style="font-size: 14px; font-weight: 700; color: #92400e; margin: 0 0 4px;">Change your password</p>
              <p style="font-size: 13px; color: #a16207; margin: 0;">Please log in and update your password immediately for security.</p>
            </td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 36px 0 16px;">
        <a href="{{login_url}}" class="btn btn-primary" style="display: inline-block; background: ${BRAND_COLOR}; color: #ffffff; padding: 15px 36px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">Login to Your Dashboard &rarr;</a>
      </div>

      <p style="font-size: 13px; color: #94a3b8; text-align: center;">If you didn't request this account, please ignore this email or contact support.</p>
    </div>
    `, "Your student account is ready. Here are your login credentials."),
  },

  welcome_existing: {
    name: "Welcome Back (Existing User)",
    subject: "Welcome to the Masterclass — You're In, {{first_name}}!",
    category: "onboarding",
    variables: ["first_name", "login_url"],
    body: baseLayout(`
    <div class="content">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-radius: 50%; margin: 0 auto 16px; text-align: center; line-height: 64px; font-size: 28px;">&#9989;</div>
        <span class="badge badge-success" style="display: inline-block; padding: 5px 14px; border-radius: 8px; font-size: 11px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; background: #ecfdf5; color: #059669;">PAYMENT CONFIRMED</span>
      </div>
      <h2 style="text-align: center;">You're in, {{first_name}}!</h2>
      <p style="text-align: center;">Your payment has been successfully processed and your enrollment is confirmed for the <strong>2026 Elite Web Development &amp; SaaS Masterclass</strong>.</p>

      <div class="card" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin: 28px 0; text-align: center;">
        <p style="font-size: 13px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 8px;">Your Account</p>
        <p style="font-size: 15px; color: #334155; margin: 0;">Log in with your <strong>existing credentials</strong> to access your student dashboard, course materials, and community.</p>
      </div>

      <div style="text-align: center; margin: 36px 0 16px;">
        <a href="{{login_url}}" class="btn btn-primary" style="display: inline-block; background: ${BRAND_COLOR}; color: #ffffff; padding: 15px 36px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">Go to Your Dashboard &rarr;</a>
      </div>

      <p style="font-size: 13px; color: #94a3b8; text-align: center;">We start on <strong style="color: #64748b;">October 19, 2026</strong>. See you there!</p>
    </div>
    `, "Your payment is confirmed! Log in with your existing credentials."),
  },

  payment_reminder: {
    name: "Payment Reminder",
    subject: "{{first_name}}, complete your masterclass payment",
    category: "payment",
    variables: ["first_name", "balance", "amount", "tier", "login_url"],
    body: baseLayout(`
    <div class="content">
      <h2>Hey {{first_name}}, don't lose your seat</h2>
      <p>You secured your spot with a <strong>{{tier}}% deposit</strong> &mdash; amazing move! But you still have an outstanding balance that needs to be cleared before the cohort begins.</p>

      <div class="card card-warning" style="border: 2px solid #fbbf24; background: #fffbeb; border-radius: 16px; padding: 28px; margin: 24px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-size: 13px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 1px;">Outstanding Balance</td>
                  <td style="text-align: right;"><span style="display: inline-block; padding: 5px 14px; border-radius: 8px; font-size: 11px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; background: #fffbeb; color: #d97706; border: 1px solid #fbbf24;">ACTION NEEDED</span></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 12px;">
              <span style="font-size: 38px; font-weight: 900; color: #d97706; letter-spacing: -1px;">GHS {{balance}}</span>
              <p style="margin: 8px 0 0; font-size: 13px; color: #92400e;">of GHS 1,000 total masterclass fee</p>
            </td>
          </tr>
        </table>
      </div>

      <p>Seats are filling up fast and we want to make sure you don't miss out. Complete your payment now to guarantee your spot and unlock full access to all masterclass resources.</p>

      <div style="text-align: center; margin: 32px 0 16px;">
        <a href="{{login_url}}" class="btn btn-gold" style="display: inline-block; background: linear-gradient(135deg, ${GOLD}, #c9a227); color: #000000; padding: 15px 36px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">Pay Balance Now &rarr;</a>
      </div>

      <div class="divider" style="height: 1px; background: linear-gradient(to right, transparent, #e2e8f0, transparent); margin: 28px 0;"></div>
      <p style="font-size: 13px; color: #94a3b8;">Having trouble? Reply to this email or WhatsApp us and we'll help you sort it out.</p>
    </div>
    `, "You have an outstanding balance of GHS {{balance}}. Complete your payment to secure your seat."),
  },

  abandoned_cart: {
    name: "Complete Your Application",
    subject: "{{first_name}}, your application is waiting...",
    category: "retarget",
    variables: ["first_name", "login_url"],
    body: baseLayout(`
    <div class="content">
      <h2>You were so close, {{first_name}}!</h2>
      <p>We noticed you started your application for the <strong>Elite Web Development &amp; SaaS Masterclass</strong> but didn't finish. Life gets busy &mdash; we get it.</p>

      <p>But here's the thing: this isn't just another course. In 4 weeks, you'll:</p>

      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; width: 40px;">
            <div style="width: 26px; height: 26px; background: #ecfdf5; border-radius: 50%; text-align: center; line-height: 26px; color: #059669; font-size: 14px;">&#10003;</div>
          </td>
          <td style="padding: 12px 0 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 15px; color: #334155;">Build production-ready web applications</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; width: 40px;">
            <div style="width: 26px; height: 26px; background: #ecfdf5; border-radius: 50%; text-align: center; line-height: 26px; color: #059669; font-size: 14px;">&#10003;</div>
          </td>
          <td style="padding: 12px 0 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 15px; color: #334155;">Master modern tools (Next.js, Supabase, Payments)</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; width: 40px;">
            <div style="width: 26px; height: 26px; background: #ecfdf5; border-radius: 50%; text-align: center; line-height: 26px; color: #059669; font-size: 14px;">&#10003;</div>
          </td>
          <td style="padding: 12px 0 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 15px; color: #334155;">Get a 1-month <strong>internship</strong> at Doctor Barns Tech</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; vertical-align: top; width: 40px;">
            <div style="width: 26px; height: 26px; background: #ecfdf5; border-radius: 50%; text-align: center; line-height: 26px; color: #059669; font-size: 14px;">&#10003;</div>
          </td>
          <td style="padding: 12px 0 12px 14px; font-size: 15px; color: #334155;">Land your first paying client</td>
        </tr>
      </table>

      <div class="card card-gradient" style="text-align: center; background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 50%, #fef3c7 100%); border: none; border-radius: 16px; padding: 28px; margin: 24px 0;">
        <p style="font-size: 12px; font-weight: 700; color: ${BRAND_COLOR}; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 8px;">Limited Seats Available</p>
        <p style="font-size: 28px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -0.5px;">Only a few spots left</p>
        <p style="color: #64748b; margin: 8px 0 0; font-size: 14px;">Start with just <strong>GHS 200</strong> (20% deposit)</p>
      </div>

      <div style="text-align: center; margin: 32px 0 16px;">
        <a href="{{login_url}}" class="btn btn-primary" style="display: inline-block; background: ${BRAND_COLOR}; color: #ffffff; padding: 15px 36px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">Complete Your Application &rarr;</a>
      </div>
    </div>
    `, "You started your masterclass application but didn't finish. Your spot is still available!"),
  },

  session_reminder: {
    name: "Cohort Starts Tomorrow",
    subject: "Tomorrow is the day, {{first_name}}!",
    category: "reminder",
    variables: ["first_name", "login_url", "cohort_name"],
    body: baseLayout(`
    <div class="content">
      <div style="text-align: center; margin-bottom: 32px;">
        <span class="badge badge-blue" style="display: inline-block; padding: 5px 14px; border-radius: 8px; font-size: 11px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; background: #eff6ff; color: ${BRAND_COLOR};">STARTING TOMORROW</span>
      </div>
      <h2>The masterclass begins tomorrow, {{first_name}}!</h2>
      <p>This is it. Tomorrow we kick off the <strong>{{cohort_name}}</strong> and your journey to becoming a professional web developer begins.</p>

      <h3 style="font-size: 16px; font-weight: 700; margin: 28px 0 16px;">Pre-flight Checklist</h3>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; width: 40px;">
            <div style="width: 26px; height: 26px; background: #ecfdf5; border-radius: 50%; text-align: center; line-height: 26px; color: #059669; font-size: 14px;">&#10003;</div>
          </td>
          <td style="padding: 12px 0 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 15px; color: #334155;"><strong>Code editor</strong> installed (VS Code recommended)</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; width: 40px;">
            <div style="width: 26px; height: 26px; background: #ecfdf5; border-radius: 50%; text-align: center; line-height: 26px; color: #059669; font-size: 14px;">&#10003;</div>
          </td>
          <td style="padding: 12px 0 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 15px; color: #334155;"><strong>Node.js</strong> v18+ installed</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; width: 40px;">
            <div style="width: 26px; height: 26px; background: #ecfdf5; border-radius: 50%; text-align: center; line-height: 26px; color: #059669; font-size: 14px;">&#10003;</div>
          </td>
          <td style="padding: 12px 0 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 15px; color: #334155;"><strong>Git</strong> configured and ready</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; width: 40px;">
            <div style="width: 26px; height: 26px; background: #ecfdf5; border-radius: 50%; text-align: center; line-height: 26px; color: #059669; font-size: 14px;">&#10003;</div>
          </td>
          <td style="padding: 12px 0 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 15px; color: #334155;"><strong>Discord</strong> account joined</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; width: 40px;">
            <div style="width: 26px; height: 26px; background: #ecfdf5; border-radius: 50%; text-align: center; line-height: 26px; color: #059669; font-size: 14px;">&#10003;</div>
          </td>
          <td style="padding: 12px 0 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 15px; color: #334155;"><strong>Stable internet</strong> connection</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; vertical-align: top; width: 40px;">
            <div style="width: 26px; height: 26px; background: #ecfdf5; border-radius: 50%; text-align: center; line-height: 26px; color: #059669; font-size: 14px;">&#10003;</div>
          </td>
          <td style="padding: 12px 0 12px 14px; font-size: 15px; color: #334155;"><strong>Schedule cleared</strong> for the next 4 weeks</td>
        </tr>
      </table>

      <div style="text-align: center; margin: 36px 0 16px;">
        <a href="{{login_url}}" class="btn btn-primary" style="display: inline-block; background: ${BRAND_COLOR}; color: #ffffff; padding: 15px 36px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">Open Student Dashboard &rarr;</a>
      </div>

      <p style="font-size: 14px; color: #475569; text-align: center; font-weight: 600;">See you tomorrow. Let's build something incredible together.</p>
    </div>
    `, "The masterclass starts tomorrow! Make sure you're ready."),
  },

  announcement: {
    name: "General Announcement",
    subject: "{{subject_line}}",
    category: "announcement",
    variables: ["first_name", "subject_line", "message_body", "login_url"],
    body: baseLayout(`
    <div class="content">
      <h2>Hey {{first_name}},</h2>
      <div style="font-size: 15px; line-height: 1.8; color: #334155;">{{message_body}}</div>
      
      <div style="text-align: center; margin: 36px 0 16px;">
        <a href="{{login_url}}" class="btn btn-primary" style="display: inline-block; background: ${BRAND_COLOR}; color: #ffffff; padding: 15px 36px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">Go to Dashboard &rarr;</a>
      </div>
    </div>
    `, "Important update from the Remote Work Hub Masterclass"),
  },

  completion: {
    name: "Course Completion",
    subject: "Congratulations {{first_name}}! You did it!",
    category: "completion",
    variables: ["first_name", "last_name", "cohort_name", "login_url"],
    body: baseLayout(`
    <div class="content" style="text-align: center;">
      <div style="font-size: 64px; margin-bottom: 16px;">&#127942;</div>
      <h2 style="font-size: 28px;">Congratulations, {{first_name}}!</h2>
      <p>You've successfully completed the <strong>{{cohort_name}}</strong>. What an incredible journey this has been!</p>

      <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border: 1px solid #334155; border-radius: 16px; padding: 32px; margin: 28px 0; text-align: center;">
        <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2.5px; margin: 0 0 10px; color: ${GOLD} !important;">Certificate of Completion</p>
        <p style="font-size: 24px; font-weight: 800; margin: 0; color: #ffffff !important; letter-spacing: -0.3px;">{{first_name}} {{last_name}}</p>
        <div style="height: 1px; background: #334155; margin: 18px auto; width: 60%;"></div>
        <p style="font-size: 13px; margin: 0; color: #94a3b8 !important;">Elite Web Development &amp; SaaS Masterclass</p>
        <p style="font-size: 12px; margin: 8px 0 0; color: #64748b !important;">Doctor Barns Tech &mdash; 2026</p>
      </div>

      <h3 style="font-size: 16px; font-weight: 700; margin: 28px 0 16px; text-align: left;">What's Next:</h3>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="text-align: left;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; width: 42px;">
            <div style="width: 30px; height: 30px; background: ${BRAND_COLOR}; border-radius: 50%; text-align: center; line-height: 30px; color: #fff; font-size: 13px; font-weight: 800;">1</div>
          </td>
          <td style="padding: 12px 0 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 15px; color: #334155;">Start your <strong>1-month internship</strong></td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; width: 42px;">
            <div style="width: 30px; height: 30px; background: ${BRAND_COLOR}; border-radius: 50%; text-align: center; line-height: 30px; color: #fff; font-size: 13px; font-weight: 800;">2</div>
          </td>
          <td style="padding: 12px 0 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 15px; color: #334155;">Launch your portfolio with the projects you built</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; width: 42px;">
            <div style="width: 30px; height: 30px; background: ${BRAND_COLOR}; border-radius: 50%; text-align: center; line-height: 30px; color: #fff; font-size: 13px; font-weight: 800;">3</div>
          </td>
          <td style="padding: 12px 0 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 15px; color: #334155;">Take the <strong>GHS 100K Challenge</strong></td>
        </tr>
        <tr>
          <td style="padding: 12px 0; vertical-align: top; width: 42px;">
            <div style="width: 30px; height: 30px; background: ${BRAND_COLOR}; border-radius: 50%; text-align: center; line-height: 30px; color: #fff; font-size: 13px; font-weight: 800;">4</div>
          </td>
          <td style="padding: 12px 0 12px 14px; font-size: 15px; color: #334155;">Refer others and earn rewards</td>
        </tr>
      </table>

      <div style="margin: 36px 0 16px;">
        <a href="{{login_url}}" class="btn btn-gold" style="display: inline-block; background: linear-gradient(135deg, ${GOLD}, #c9a227); color: #000000; padding: 15px 36px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">View Your Certificate &rarr;</a>
      </div>
    </div>
    `, "You've completed the masterclass! Your certificate is ready."),
  },

  reengagement: {
    name: "We Miss You",
    subject: "{{first_name}}, the masterclass is still open for you",
    category: "retarget",
    variables: ["first_name", "login_url"],
    body: baseLayout(`
    <div class="content">
      <h2>Hey {{first_name}}, we haven't forgotten about you</h2>
      <p>A while back, you showed interest in the <strong>Elite Web Development &amp; SaaS Masterclass</strong>. We wanted to check in and let you know the door is still open.</p>

      <div class="card" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 800; color: #0f172a;">What you'll walk away with:</h3>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; vertical-align: top; width: 40px;">
              <div style="width: 26px; height: 26px; background: #ecfdf5; border-radius: 50%; text-align: center; line-height: 26px; color: #059669; font-size: 14px;">&#10003;</div>
            </td>
            <td style="padding: 12px 0 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 15px; color: #334155;">Real-world portfolio projects</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; vertical-align: top; width: 40px;">
              <div style="width: 26px; height: 26px; background: #ecfdf5; border-radius: 50%; text-align: center; line-height: 26px; color: #059669; font-size: 14px;">&#10003;</div>
            </td>
            <td style="padding: 12px 0 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 15px; color: #334155;">Modern tech stack mastery</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; vertical-align: top; width: 40px;">
              <div style="width: 26px; height: 26px; background: #ecfdf5; border-radius: 50%; text-align: center; line-height: 26px; color: #059669; font-size: 14px;">&#10003;</div>
            </td>
            <td style="padding: 12px 0 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 15px; color: #334155;">Paid internship opportunity</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; vertical-align: top; width: 40px;">
              <div style="width: 26px; height: 26px; background: #ecfdf5; border-radius: 50%; text-align: center; line-height: 26px; color: #059669; font-size: 14px;">&#10003;</div>
            </td>
            <td style="padding: 12px 0 12px 14px; font-size: 15px; color: #334155;">Your first paying client strategy</td>
          </tr>
        </table>
      </div>

      <p>This isn't theory. This is 4 weeks of building real products with real deadlines and real outcomes.</p>
      
      <div style="text-align: center; margin: 32px 0 16px;">
        <a href="{{login_url}}" class="btn btn-primary" style="display: inline-block; background: ${BRAND_COLOR}; color: #ffffff; padding: 15px 36px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">Apply Now &rarr;</a>
      </div>

      <div class="divider" style="height: 1px; background: linear-gradient(to right, transparent, #e2e8f0, transparent); margin: 28px 0;"></div>
      <p style="font-size: 13px; color: #94a3b8; text-align: center;">Start with just <strong>GHS 200</strong> (20% deposit) to secure your seat.</p>
    </div>
    `, "The masterclass is still open. Your journey to becoming a professional web developer starts here."),
  },
};

/** Cohort WhatsApp group invite — ONLY include in post-payment messages */
export const COHORT_WHATSAPP_LINK = "https://chat.whatsapp.com/L5zb4r6yjVfDMlXtgrZEb8";

export const SMS_TEMPLATES = {
  payment_confirmation: {
    name: "Payment Confirmation SMS",
    category: "payment",
    variables: ["first_name", "amount", "tier", "whatsapp_link"],
    body: `Hi {{first_name}}! Your payment of GHS {{amount}} ({{tier}}% tier) for the Remote Work Hub Masterclass has been confirmed. Your seat is secured! Check your email for login details.\n\nJoin the Cohort WhatsApp Group: {{whatsapp_link}}\n- Remote Work Hub`,
  },
  balance_reminder: {
    name: "Balance Reminder SMS",
    category: "payment",
    variables: ["first_name", "balance"],
    body: `Hi {{first_name}}, you have an outstanding balance of GHS {{balance}} for the Remote Work Hub Masterclass. Complete your payment to secure full access. Reply HELP for assistance. - Remote Work Hub`,
  },
  session_reminder: {
    name: "Session Reminder SMS",
    category: "reminder",
    variables: ["first_name"],
    body: `Hi {{first_name}}! The Remote Work Hub Masterclass starts tomorrow. Make sure your dev environment is ready. Log into your dashboard for the prep checklist. See you there! - Remote Work Hub`,
  },
  abandoned_followup: {
    name: "Abandoned Application SMS",
    category: "retarget",
    variables: ["first_name"],
    body: `Hi {{first_name}}, you started your Remote Work Hub Masterclass application but didn't finish. Seats are limited! Complete it now and start with just GHS 200. Visit remoteworkhub.org/apply - Remote Work Hub`,
  },
  welcome_sms: {
    name: "Welcome SMS",
    category: "welcome",
    variables: ["first_name", "email", "password", "login_url", "whatsapp_link"],
    body: `Welcome to the RWH Masterclass, {{first_name}}! Your account is ready.\nLogin: {{login_url}}\nEmail: {{email}}\nPassword: {{password}}\nChange your password after logging in.\n\nJoin the Cohort WhatsApp Group: {{whatsapp_link}}\n- Remote Work Hub`,
  },
  general_announcement: {
    name: "General Announcement SMS",
    category: "announcement",
    variables: ["first_name", "message_body"],
    body: `Hi {{first_name}}, {{message_body}} - Remote Work Hub`,
  },
};

export function mergeVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value || "");
  }
  return result;
}

export type EmailTemplateKey = keyof typeof EMAIL_TEMPLATES;
export type SmsTemplateKey = keyof typeof SMS_TEMPLATES;
