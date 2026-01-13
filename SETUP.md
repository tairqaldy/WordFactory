# WordFactory Setup Guide

## Google Cloud API Setup

### Enable Generative Language API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** > **Library**
4. Search for "Generative Language API"
5. Click **Enable**

Alternatively, use this direct link:
**https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/overview**

### Get API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the API key
4. (Optional) Restrict the API key to only Generative Language API for security

### Add to Environment Variables

Add the API key to your `.env.local` file:

```env
GOOGLE_CLOUD_API_KEY=your-api-key-here
```

### Verify Setup

After enabling the API, wait a few minutes for it to propagate, then restart your dev server:

```bash
bun dev
```

## Common Issues

### Error: "SERVICE_DISABLED"

This means the Generative Language API is not enabled in your Google Cloud project. Follow the steps above to enable it.

### Error: "403 Forbidden"

- Check that your API key is correct
- Verify the API is enabled in your project
- Make sure billing is enabled (Gemini API requires billing)

### Model Not Found

The correct model name is `gemini-1.5-flash`. If you see model errors, check that you're using the correct model name.

## Next Steps

Once the API is enabled:
1. Restart your development server
2. Try creating a card
3. The app should now work with AI-powered features
