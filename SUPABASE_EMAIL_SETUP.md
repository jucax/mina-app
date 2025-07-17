# Supabase Email Setup Guide

## Password Reset Email Configuration

To ensure your password reset emails work correctly, you need to configure email templates in your Supabase dashboard.

### Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `mina_app`
3. Navigate to **Authentication** → **Email Templates**

### Step 2: Configure Password Reset Template

1. Click on **Password Reset** template
2. Customize the email template with your branding:

```html
<!-- Example Password Reset Email Template -->
<h2>Recuperar Contraseña - Mina App</h2>

<p>Hola,</p>

<p>Has solicitado restablecer tu contraseña para tu cuenta en Mina App.</p>

<p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>

<a href="{{ .ConfirmationURL }}" style="background-color: #FFA733; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
  Restablecer Contraseña
</a>

<p>Si no solicitaste este cambio, puedes ignorar este correo.</p>

<p>Este enlace expirará en 24 horas.</p>

<p>Saludos,<br>El equipo de Mina App</p>
```

### Step 3: Configure Email Settings

1. Go to **Authentication** → **Settings**
2. Under **Email Auth**, ensure:
   - **Enable email confirmations** is checked
   - **Enable email change confirmations** is checked
   - **Enable secure email change** is checked

### Step 4: Test Email Configuration

1. Use the test script: `node test_password_reset.js`
2. Replace the test email with a real email from your database
3. Verify that the password reset email is received

### Step 5: Custom Domain (Optional)

For production, consider setting up a custom domain for emails:

1. Go to **Authentication** → **Settings**
2. Under **SMTP Settings**, configure your SMTP provider
3. Update the **Site URL** to match your app's domain

### Important Notes

- **Rate Limiting**: Supabase has rate limits for password reset emails
- **Email Delivery**: Check spam folders if emails aren't received
- **Redirect URL**: The `mina-app://reset-password` URL should be configured in your app's deep linking

### Troubleshooting

1. **Emails not sending**: Check Supabase logs in the dashboard
2. **Invalid redirect URL**: Ensure your app handles the deep link
3. **Rate limiting**: Wait a few minutes between attempts

### Security Considerations

- Password reset links expire after 24 hours
- Users can only request one reset at a time
- Failed attempts are logged for security monitoring 