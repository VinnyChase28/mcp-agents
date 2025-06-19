# Claude Desktop Example Prompts

A comprehensive collection of example prompts to test your MCP agents with Claude Desktop.

## 🧮 Calculator Server Prompts

### Basic Math Operations
```
"Can you add 42 and 58 for me?"
"What's 15 times 7?"
"Please divide 144 by 12"
"Calculate 25 + 75 - 10"
```

### Real-World Calculations
```
"I bought 3 books at $12.99 each. How much did I spend total?"
"If I save $50 per month, how much will I have after 8 months?"
"A recipe serves 4 people but I need to feed 6. If it calls for 2 cups of flour, how much do I need?"
"I'm splitting a $89.50 dinner bill among 5 people. How much does each person owe?"
```

### Multi-Step Problems
```
"Add 25 and 35, then multiply the result by 3"
"I have 100 dollars. If I spend 30 dollars and then earn 15 dollars, how much do I have?"
"Calculate the area of a rectangle that's 12 units by 8 units"
```

## 📁 File Manager Server Prompts

### Reading Files
```
"Can you read my package.json file and tell me about the dependencies?"
"Please show me the contents of my .gitignore file"
"Read the README.md file in my current directory"
"What's in my tsconfig.json configuration?"
```

### Creating Files
```
"Create a shopping list file with milk, bread, eggs, and apples"
"Write a simple HTML template to a file called index.html"
"Create a TODO list file with 5 programming tasks"
"Generate a .env.example file with common environment variables"
```

### Directory Operations
```
"List all files in my current directory"
"Show me what's in my Desktop folder"
"What files are in the src directory?"
"List the contents of my Documents folder"
```

### Development Workflows
```
"Create a new React component file called Button.tsx with a basic structure"
"Read my package.json and create a summary of the project"
"Create a new markdown file documenting my API endpoints"
"List all .ts files in my project and organize them by directory"
```

## 🌐 API Client Server Prompts

### Testing Public APIs
```
"Make a GET request to https://jsonplaceholder.typicode.com/posts/1 and show me the response"
"Fetch user data from https://jsonplaceholder.typicode.com/users/1"
"Get a random quote from https://api.quotable.io/random"
"Check the GitHub API for information about the 'octocat' user"
```

### Local Development Testing
```
"Test my local API health endpoint at http://localhost:3001/health"
"Make a GET request to my development server at http://localhost:3000/api/status"
"Send a test POST request to http://localhost:3001/api/chat/sessions/session_1/messages with a hello message"
```

### API Integration & Testing
```
"Send a POST request to https://httpbin.org/post with some test JSON data"
"Make a request to check if my website is responding properly"
"Test my webhook endpoint with a sample payload"
"Fetch data from a weather API and show me the current conditions"
```

## 🔄 Combined Multi-Server Prompts

### Data Processing Workflows
```
"Get data from an API, save it to a file, then calculate some statistics from the numbers"
"Read my sales data file, calculate the total revenue, and save a summary report"
"Fetch user data from an API, process it, and create a formatted report file"
```

### Development Tasks
```
"Check my API health, read my current package.json, and calculate how many dependencies I have"
"Create a new configuration file, make a test API call, and document the results"
"List my project files, make a request to check my deployed API, and create a status report"
```

### File & API Integration
```
"Read my API configuration file, make a request to the specified endpoint, and save the response"
"Get data from a public API, format it nicely, and save it to a new file"
"Read my environment variables file and test the API endpoints listed there"
```

## 🎯 Testing & Debugging Prompts

### Error Handling
```
"Try to divide 10 by 0 and show me what happens"
"Attempt to read a file that doesn't exist"
"Make a request to an invalid URL and handle the error"
```

### System Testing
```
"Test all three of my MCP servers by performing one operation with each"
"Create a test file, read it back, and then make an API call to verify everything is working"
"Perform a series of calculations and save the results to a file"
```

## 💡 Creative Use Cases

### Personal Productivity
```
"Help me calculate my monthly budget, save it to a file, and set up a tracking system"
"Create a daily log file with today's date and fetch an inspirational quote to include"
"Calculate my project timeline and create a milestone file"
```

### Learning & Exploration
```
"Teach me about APIs by making requests to different endpoints and explaining the responses"
"Show me how file operations work by creating, reading, and modifying files"
"Demonstrate mathematical concepts using the calculator with real examples"
```

### Development Workflows
```
"Help me set up a new project by creating necessary files and testing my development environment"
"Audit my project by reading configuration files and testing API endpoints"
"Create documentation by reading my code files and generating summaries"
```

## 🚀 Getting Started

1. **Restart Claude Desktop** after configuring your MCP servers
2. **Look for the tool icon** 🔨 indicating MCP servers are connected
3. **Start with simple prompts** like basic calculations or file reading
4. **Try combinations** of different server capabilities
5. **Explore real-world scenarios** that match your workflow

## 💡 Tips for Better Results

- Be specific about file paths (use absolute paths when needed)
- Include context about what you're trying to accomplish
- Ask Claude to explain what it's doing with each tool
- Combine operations for more complex workflows
- Use error handling prompts to understand limitations

Remember: Claude will use your MCP servers automatically when you ask for operations they can handle! 