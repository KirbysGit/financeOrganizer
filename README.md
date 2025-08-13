# 💰 Centi - Your Friendly Finance Companion

> **Simple, beautiful, and insightful financial tracking that actually makes sense.**

## 🎯 What is Centi?

Centi is a personal finance tracking application designed with one simple goal: **to show you where your money is going without overwhelming you with complex interfaces.**

After the closure of Mint, I realized how much I missed having a simple, friendly way to track my finances. Most financial apps today focus on complex data formatting and take a brutalist approach to user experience. Centi is different - it's built around the idea that financial insights should be welcoming, not intimidating.

## ✨ What Makes Centi Special?

### 🎨 **User Experience First**
- **Progressive Complexity**: The dashboard starts with a general overview and gets more specific as you scroll down
- **Friendly Interface**: Clean, modern design that doesn't overwhelm users with data
- **Immediate Insights**: When you log in, you should immediately see "Oh, that's where my money is going"

### 🧠 **Smart Financial Intelligence**
- **Centi Score**: A personalized financial health metric unique to your situation
- **Personalized Insights**: Financial advice based on your unique financial background
- **Growth Tracking**: Monitor your financial progress over time

### 🔗 **Multiple Connection Options**
- **Plaid Integration**: Connect your bank accounts securely
- **Manual Entry**: Add transactions manually for full control
- **File Upload**: Import CSV files from your bank statements
- **Flexible Setup**: Choose the method that works best for you

## 🏗️ How It's Built

### **Frontend (React + Styled Components)**
- **Modern React**: Built with React 18 and modern hooks
- **Beautiful Styling**: Custom CSS with CSS variables for consistent theming
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Particle Effects**: Engaging visual elements that make the experience feel premium

### **Backend (FastAPI + SQLite)**
- **FastAPI**: Modern, fast Python web framework
- **SQLite Database**: Simple, reliable data storage
- **JWT Authentication**: Secure user sessions
- **Plaid Integration**: Professional-grade financial data connectivity

### **Key Technologies**
- **Frontend**: React, Vite, Styled Components
- **Backend**: Python, FastAPI, SQLAlchemy
- **Database**: SQLite
- **Authentication**: JWT, Google OAuth
- **Financial Data**: Plaid API

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v16 or higher)
- Python 3.8+
- Plaid account (for bank connections)

### **Quick Start**
```bash
# Clone the repository
git clone https://github.com/yourusername/finance-organizer.git
cd finance-organizer

# Frontend setup
cd frontend
npm install
npm run dev

# Backend setup
cd ../backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### **Environment Variables**
Create a `.env` file in the backend directory:
```env
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
SECRET_KEY=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_oauth_id
GOOGLE_CLIENT_SECRET=your_google_oauth_secret
```

## 🎨 Design Philosophy

### **The Centi Approach**
Centi's design philosophy centers around **progressive disclosure** and **user comfort**:

1. **Start Simple**: Begin with high-level insights that are easy to understand
2. **Build Complexity**: Gradually introduce more detailed information as users scroll
3. **Maintain Clarity**: Never overwhelm users with too much data at once
4. **Visual Hierarchy**: Use color, spacing, and typography to guide attention

### **Color Scheme & Styling**
- **Primary Colors**: Blues and greens that feel trustworthy and financial
- **Accent Colors**: Warm tones for positive financial indicators
- **Typography**: Clean, readable fonts that don't strain the eyes
- **Spacing**: Generous whitespace to prevent cognitive overload

## 🔮 Future Vision

This is just the beginning! Centi is designed to grow into a comprehensive financial companion that truly puts user experience first. Future plans include:

- **Enhanced Analytics**: More sophisticated financial insights
- **Goal Setting**: Track financial goals and milestones
- **Budget Planning**: Intelligent budget recommendations
- **Mobile App**: Native mobile experience
- **Community Features**: Share insights with trusted friends/family

## 🤝 Contributing

I'm always open to feedback, collaboration, or just connecting with fellow developers and finance enthusiasts! 

- **GitHub**: [@KirbysGit](https://github.com/KirbysGit)
- **LinkedIn**: [Colin Kirby](https://www.linkedin.com/in/colinwkirby/)

## 📝 Development Notes

### **AI-Assisted Development**
This project was developed with the help of Cursor AI, primarily for:
- Inline commenting and documentation
- Styling similar components
- Code organization and structure

**Every single line of code has been personally overseen and refined** to ensure quality and functionality.

### **Project Structure**
```
financeOrganizer/
├── frontend/          # React application
├── backend/           # FastAPI server
├── sample_data/       # Example CSV files
└── docs/             # Documentation
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ by Colin Kirby**

*Centi: Where financial tracking meets friendly design.*
