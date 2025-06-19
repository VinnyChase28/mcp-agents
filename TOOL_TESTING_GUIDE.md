# 🛠️ Tool Testing Guide

## Overview

Your AI chat now has **tool calling capabilities**! The AI can invoke MCP server tools to perform calculations, file operations, and web requests. Here's how to test each feature.

## 🚀 Getting Started

1. **Start the development server:**
   ```bash
   ./dev-web.sh
   ```

2. **Open your browser:**
   Navigate to http://localhost:3000

3. **Look for the tool sidebar:**
   You'll see a "Tool Activity" panel on the right side of the chat interface.

## 🧮 Calculator Tools

### ✅ Test Phrases:

**Addition:**
- "What is 15 + 27?"
- "Add 123 and 456"
- "Calculate 5.5 plus 3.2"

**Multiplication:**
- "What is 8 times 12?"
- "Multiply 25 by 4"
- "Calculate 3.14 * 2"

**Division:**
- "What is 100 divided by 5?"
- "Divide 144 by 12"
- "Calculate 22 / 7"

**Expected Behavior:**
- ✅ Tool sidebar shows calculator icon
- ✅ Tool status shows "active" then "completed"
- ✅ Chat shows tool invocation details
- ✅ AI responds with the calculation result

## 📁 File Manager Tools

### ✅ Test Phrases:

**Read File:**
- "Read the contents of package.json"
- "Show me what's in README.md"
- "Can you read the file at ./apps/web/package.json?"

**Write File:**
- "Create a file called test.txt with the content 'Hello World'"
- "Write 'This is a test' to a file named example.txt"
- "Save the text 'AI generated content' to output.md"

**List Directory:**
- "List the files in the current directory"
- "Show me what's in the apps folder"
- "What files are in ./packages?"

**Expected Behavior:**
- ✅ Tool sidebar shows file/folder icons
- ✅ Simulated file operations (since we're using mock data)
- ✅ AI responds with file contents or operation results

## 🌐 API Client Tools

### ✅ Test Phrases:

**GET Requests:**
- "Make a GET request to https://jsonplaceholder.typicode.com/posts/1"
- "Fetch data from https://api.github.com/users/octocat"
- "Get the content from https://httpbin.org/get"

**POST Requests:**
- "Make a POST request to https://httpbin.org/post with data {\"test\": \"value\"}"
- "Send a POST to https://jsonplaceholder.typicode.com/posts with title and body"

**Expected Behavior:**
- ✅ Tool sidebar shows globe icon
- ✅ Simulated HTTP requests
- ✅ AI responds with request results

## 🎯 Visual Indicators

### Tool Sidebar Features:
- **📊 Tool Categories:** Calculator, File Manager, API Client
- **🔄 Status Icons:** 
  - 🔵 Blue clock = Active
  - 🟢 Green checkmark = Completed  
  - 🔴 Red X = Error
- **⏱️ Timing:** Shows when tools were used
- **📝 Arguments:** Shows what parameters were passed
- **✅ Results:** Shows completion status

### Chat Interface Features:
- **🔧 Tool Invocation Boxes:** Blue boxes showing tool calls
- **⚡ Active Tool Indicator:** Spinning wrench icon in header
- **📱 Tool Status:** Visual feedback for each tool execution

## 🧪 Advanced Testing

### Complex Queries:
1. **"Calculate 15 * 8, then read the package.json file"**
   - Should trigger both calculator and file tools

2. **"What's 100 divided by 3, and can you list the files in the apps directory?"**
   - Should show multiple tool invocations

3. **"Make a GET request to https://httpbin.org/get and tell me what you find"**
   - Should show API client tool usage

### Error Testing:
1. **"Divide 10 by 0"**
   - Should show error handling

2. **"Read a file that doesn't exist"**
   - Should handle file not found gracefully

## 🚨 Troubleshooting

### If tools aren't working:
1. **Check the console** for any errors
2. **Verify API key** is set in .env file
3. **Restart the server** with `./dev-web.sh`
4. **Check network tab** for API call failures

### If sidebar isn't updating:
1. **Refresh the page**
2. **Check browser console** for JavaScript errors
3. **Verify tool invocations** are showing in chat

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ Tool sidebar shows activity
- ✅ Chat displays tool invocation boxes
- ✅ AI responds with tool results
- ✅ Status indicators update correctly
- ✅ Multiple tools can be used in sequence

## 📝 Example Conversation

```
You: "What is 25 * 4, and can you read the README.md file?" 