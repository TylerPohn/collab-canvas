# 🔑 **Environment Variables Setup Guide**

## 🚨 **Current Issue**

The LangChain agent is failing because the `VITE_OPENAI_API_KEY` environment variable is missing.

## 📝 **Required Steps**

### **1. Create `.env` File**

Create a `.env` file in the root directory of your project (`collab-canvas/.env`) with the following content:

```bash
# OpenAI API Configuration
VITE_OPENAI_API_KEY=your_actual_openai_api_key_here

# Firebase Configuration (if needed)
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### **2. Get Your OpenAI API Key**

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in to your account
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the generated key
6. Replace `your_actual_openai_api_key_here` in the `.env` file

### **3. Restart Development Server**

After creating the `.env` file, restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## 🔒 **Security Notes**

### **Important**:

- **Never commit the `.env` file to version control**
- The `.env` file should already be in `.gitignore`
- Only share the `.env.example` file (without real keys)

### **Vite Environment Variables**:

- All client-side environment variables **must** be prefixed with `VITE_`
- Variables without `VITE_` prefix are not accessible in the browser
- This is a security feature to prevent accidental exposure of server-side secrets

## 🧪 **Testing the Setup**

1. **Create the `.env` file** with your actual OpenAI API key
2. **Restart the development server**
3. **Open the application** at http://localhost:5177/
4. **Click the Psychology icon** (🧠) in the toolbar
5. **Try a simple command** like "Create a blue rectangle"
6. **Check console logs** for successful initialization

## 📋 **Expected Console Output**

After proper setup, you should see:

```
🤖 Creating new LangChain agent instance...
🤖 Initializing LangChain agent...
✅ LangChain agent initialized successfully
🤖 LangChain Agent processing: { canvasId: "...", userId: "...", userInput: "..." }
🤖 LangChain Agent result: { output: "...", intermediateSteps: [...] }
```

## 🚨 **Common Issues**

### **Issue**: "The OPENAI_API_KEY environment variable is missing"

**Solution**: Ensure your `.env` file exists and contains `VITE_OPENAI_API_KEY=your_key`

### **Issue**: "Agent initialization timeout"

**Solution**: Check your internet connection and OpenAI API key validity

### **Issue**: "Rate limit exceeded"

**Solution**: You may have hit OpenAI's rate limits. Wait a moment and try again.

## 🎯 **Next Steps**

1. **Create the `.env` file** with your OpenAI API key
2. **Restart the development server**
3. **Test the LangChain agent** with simple commands
4. **Verify the system works** end-to-end

Once the environment variables are properly configured, the LangChain agent should initialize and work correctly!

---

**Status: ⚠️ REQUIRES ENVIRONMENT SETUP**  
**Next Action: Create `.env` file with OpenAI API key**
