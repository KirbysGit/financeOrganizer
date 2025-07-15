// Imports.
import React from 'react';

// ------------------------------------------------------------------------------------------------ Utility Functions.

// -------------------------------------------------------- Function 4 Formatting Currency.
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(amount);
};

// -------------------------------------------------------- Function 4 Getting Age-Based Financial Context.
const getAgeContext = (age) => {
    if (age < 25) return { stage: 'early-career', focus: 'building-foundation' };
    if (age < 35) return { stage: 'career-growth', focus: 'debt-reduction' };
    if (age < 45) return { stage: 'wealth-building', focus: 'investment-growth' };
    if (age < 55) return { stage: 'peak-earning', focus: 'retirement-prep' };
    return { stage: 'pre-retirement', focus: 'wealth-preservation' };
};

// -------------------------------------------------------- Function 4 Analyzing Debt-to-Income Ratio.
const analyzeDebtToIncome = (monthlyIncome, totalDebt) => {
    if (!monthlyIncome || !totalDebt) return null;
    
    const dti = (totalDebt / monthlyIncome) * 100;
    
    if (dti < 20) return { level: 'excellent', message: 'Your debt-to-income ratio is excellent! You have significant borrowing capacity for future investments.' };
    if (dti < 30) return { level: 'good', message: 'Your debt-to-income ratio is manageable. You\'re in a good position to take on strategic debt if needed.' };
    if (dti < 40) return { level: 'caution', message: 'Your debt-to-income ratio is approaching concerning levels. Focus on debt reduction before taking on new loans.' };
    return { level: 'critical', message: 'Your debt-to-income ratio is high. Prioritize debt reduction to improve your financial flexibility.' };
};

// -------------------------------------------------------- Function 4 Analyzing Emergency Fund Status.
const analyzeEmergencyFund = (monthlyExpenses, liquidAssets) => {
    if (!monthlyExpenses || !liquidAssets) return null;
    
    const monthsCovered = liquidAssets / monthlyExpenses;
    
    if (monthsCovered >= 6) return { status: 'well-funded', message: 'Your emergency fund is well-funded! You\'re prepared for unexpected expenses.' };
    if (monthsCovered >= 3) return { status: 'adequate', message: 'Your emergency fund is adequate but could be stronger. Aim for 6 months of expenses.' };
    if (monthsCovered >= 1) return { status: 'minimal', message: 'Your emergency fund is minimal. Build it to 3-6 months of expenses for better security.' };
    return { status: 'insufficient', message: 'You need an emergency fund! Start with 1 month of expenses, then build to 3-6 months.' };
};

// -------------------------------------------------------- Function 4 Analyzing Investment Readiness.
const analyzeInvestmentReadiness = (scoreBreakdown, monthlyIncome) => {
    if (!scoreBreakdown || !monthlyIncome) return null;
    
    const { netWorth, liabilities, cashFlow } = scoreBreakdown;
    const monthlyInvestment = cashFlow?.value > 0 ? Math.min(cashFlow.value * 0.2, 500) : 0;
    
    // Check prerequisites
    const hasEmergencyFund = netWorth?.value > 0 && liabilities?.value < monthlyIncome * 3;
    const hasPositiveCashFlow = cashFlow?.value > 0;
    const hasLowDebt = liabilities?.value < monthlyIncome * 2;
    
    if (!hasEmergencyFund) return { ready: false, priority: 'emergency-fund', message: 'Build your emergency fund before investing. Aim for 3-6 months of expenses.' };
    if (!hasPositiveCashFlow) return { ready: false, priority: 'cash-flow', message: 'Improve your cash flow before investing. Focus on increasing income or reducing expenses.' };
    if (!hasLowDebt) return { ready: false, priority: 'debt-reduction', message: 'Reduce high-interest debt before investing. The returns on debt payoff often exceed investment returns.' };
    
    return { 
        ready: true, 
        monthlyAmount: monthlyInvestment,
        message: `You're ready to invest! Consider starting with $${monthlyInvestment} monthly in a diversified portfolio.`
    };
};

// -------------------------------------------------------- Function 4 Analyzing Retirement Readiness.
const analyzeRetirementReadiness = (scoreBreakdown, age) => {
    if (!scoreBreakdown || !age) return null;
    
    const { netWorth, assets } = scoreBreakdown;
    const targetNetWorth = age * 10000; // Simple rule of thumb
    const currentNetWorth = netWorth?.value || 0;
    const retirementAssets = assets?.value || 0;
    
    const progress = (currentNetWorth / targetNetWorth) * 100;
    
    if (progress >= 100) return { status: 'ahead', message: 'You\'re ahead of schedule for retirement! Consider increasing your investment contributions.' };
    if (progress >= 75) return { status: 'on-track', message: 'You\'re on track for retirement. Keep up your current savings rate.' };
    if (progress >= 50) return { status: 'behind', message: 'You\'re behind on retirement savings. Consider increasing contributions by 1-2% of income.' };
    return { status: 'critical', message: 'You need to catch up on retirement savings. Aim to save 15-20% of your income.' };
};

// -------------------------------------------------------- Function 4 Getting Personalized Positive Insights.
export const getPersonalizedPositiveInsights = (scoreBreakdown, userStats = {}) => {
    if (!scoreBreakdown) return { message: "Great job on your financial journey!", strength: "general" };
    
    const { netWorth, assets, liabilities, cashFlow } = scoreBreakdown;
    const insights = [];
    
    // Net Worth Analysis
    if (netWorth?.value > 100000) {
        insights.push({
            message: `Your net worth of ${formatCurrency(netWorth.value)} puts you in the top 20% of Americans! 🎉`,
            strength: "high-net-worth",
            priority: 1
        });
    } else if (netWorth?.value > 50000) {
        insights.push({
            message: `Your net worth of ${formatCurrency(netWorth.value)} is well above average! You're building real wealth. 💪`,
            strength: "above-average-net-worth",
            priority: 2
        });
    } else if (netWorth?.value > 0) {
        insights.push({
            message: `You have a positive net worth of ${formatCurrency(netWorth.value)} - that's a solid foundation! 🌱`,
            strength: "positive-net-worth",
            priority: 3
        });
    }
    
    // Asset Analysis
    if (assets?.value > 200000) {
        insights.push({
            message: `Your assets of ${formatCurrency(assets.value)} show exceptional wealth building! 📈`,
            strength: "high-assets",
            priority: 1
        });
    } else if (assets?.value > 100000) {
        insights.push({
            message: `Your assets of ${formatCurrency(assets.value)} demonstrate strong financial growth! 🏗️`,
            strength: "good-assets",
            priority: 2
        });
    }
    
    // Debt Analysis
    if (liabilities?.value === 0) {
        insights.push({
            message: `You're completely debt-free! This gives you incredible financial flexibility. 🎊`,
            strength: "debt-free",
            priority: 1
        });
    } else if (liabilities?.value < 10000) {
        insights.push({
            message: `Your low debt of ${formatCurrency(liabilities.value)} is very manageable! ✅`,
            strength: "low-debt",
            priority: 2
        });
    }
    
    // Cash Flow Analysis
    if (cashFlow?.value > 5000) {
        insights.push({
            message: `Your strong cash flow of ${formatCurrency(cashFlow.value)} gives you excellent financial momentum! 💰`,
            strength: "high-cash-flow",
            priority: 1
        });
    } else if (cashFlow?.value > 2000) {
        insights.push({
            message: `Your positive cash flow of ${formatCurrency(cashFlow.value)} shows great income management! ➕`,
            strength: "positive-cash-flow",
            priority: 2
        });
    }
    
    // Emergency Fund Analysis
    const emergencyFund = analyzeEmergencyFund(userStats.monthlyExpenses, userStats.liquidAssets);
    if (emergencyFund?.status === 'well-funded') {
        insights.push({
            message: emergencyFund.message,
            strength: "emergency-fund",
            priority: 2
        });
    }
    
    // Return the highest priority insight
    return insights.length > 0 
        ? insights.sort((a, b) => a.priority - b.priority)[0]
        : { message: "You're making progress on your financial goals! 🌱", strength: "general" };
};

// -------------------------------------------------------- Function 4 Getting Personalized Growth Areas.
export const getPersonalizedGrowthAreas = (scoreBreakdown, userStats = {}) => {
    if (!scoreBreakdown) return { message: "Focus on building your financial foundation.", area: "general" };
    
    const { netWorth, assets, liabilities, cashFlow } = scoreBreakdown;
    const areas = [];
    
    // Net Worth Issues
    if (netWorth?.value < 0) {
        areas.push({
            message: `Your negative net worth of ${formatCurrency(Math.abs(netWorth.value))} needs immediate attention. Focus on debt reduction first.`,
            area: "negative-net-worth",
            priority: 1,
            action: "debt-reduction"
        });
    } else if (netWorth?.value < 10000) {
        areas.push({
            message: `Your net worth of ${formatCurrency(netWorth.value)} is below average. Build your emergency fund and start investing.`,
            area: "low-net-worth",
            priority: 2,
            action: "emergency-fund"
        });
    }
    
    // High Debt Issues
    if (liabilities?.value > 50000) {
        areas.push({
            message: `Your high debt of ${formatCurrency(liabilities.value)} is significantly impacting your financial freedom.`,
            area: "high-debt",
            priority: 1,
            action: "debt-reduction"
        });
    } else if (liabilities?.value > 20000) {
        areas.push({
            message: `Your debt of ${formatCurrency(liabilities.value)} is above recommended levels. Consider debt consolidation.`,
            area: "moderate-debt",
            priority: 2,
            action: "debt-management"
        });
    }
    
    // Cash Flow Issues
    if (cashFlow?.value < 0) {
        areas.push({
            message: `Your negative cash flow of ${formatCurrency(Math.abs(cashFlow.value))} means you're spending more than you earn.`,
            area: "negative-cash-flow",
            priority: 1,
            action: "expense-reduction"
        });
    } else if (cashFlow?.value < 1000) {
        areas.push({
            message: `Your low cash flow of ${formatCurrency(cashFlow.value)} limits your savings and investment potential.`,
            area: "low-cash-flow",
            priority: 2,
            action: "income-increase"
        });
    }
    
    // Emergency Fund Issues
    const emergencyFund = analyzeEmergencyFund(userStats.monthlyExpenses, userStats.liquidAssets);
    if (emergencyFund?.status === 'insufficient') {
        areas.push({
            message: emergencyFund.message,
            area: "emergency-fund",
            priority: 1,
            action: "emergency-fund"
        });
    }
    
    // Investment Readiness
    const investmentReadiness = analyzeInvestmentReadiness(scoreBreakdown, userStats.monthlyIncome);
    if (investmentReadiness && !investmentReadiness.ready) {
        areas.push({
            message: investmentReadiness.message,
            area: "investment-readiness",
            priority: 2,
            action: investmentReadiness.priority
        });
    }
    
    // Return the highest priority area
    return areas.length > 0 
        ? areas.sort((a, b) => a.priority - b.priority)[0]
        : { message: "Consider building an emergency fund and reducing debt.", area: "general", action: "foundation" };
};

// -------------------------------------------------------- Function 4 Getting Personalized Action Steps.
export const getPersonalizedActionSteps = (scoreBreakdown, userStats = {}) => {
    if (!scoreBreakdown) return { message: "Focus on building savings and reducing debt.", action: "foundation" };
    
    const { netWorth, assets, liabilities, cashFlow } = scoreBreakdown;
    const steps = [];
    
    // Critical Actions (Priority 1)
    if (netWorth?.value < 0) {
        steps.push({
            message: "Stop all non-essential spending and focus 100% on debt reduction. Consider debt consolidation.",
            action: "debt-reduction",
            priority: 1,
            timeline: "immediate"
        });
    }
    
    if (cashFlow?.value < 0) {
        steps.push({
            message: "Create a strict budget and cut expenses by 20%. Consider a side hustle for extra income.",
            action: "expense-reduction",
            priority: 1,
            timeline: "immediate"
        });
    }
    
    // Important Actions (Priority 2)
    if (liabilities?.value > 20000) {
        steps.push({
            message: "Focus on high-interest debt first. Consider the debt avalanche method for maximum impact.",
            action: "debt-management",
            priority: 2,
            timeline: "3-6 months"
        });
    }
    
    const emergencyFund = analyzeEmergencyFund(userStats.monthlyExpenses, userStats.liquidAssets);
    if (emergencyFund?.status === 'insufficient') {
        steps.push({
            message: "Build emergency fund to 3 months of expenses. Automate monthly transfers.",
            action: "emergency-fund",
            priority: 2,
            timeline: "6-12 months"
        });
    }
    
    // Growth Actions (Priority 3)
    const investmentReadiness = analyzeInvestmentReadiness(scoreBreakdown, userStats.monthlyIncome);
    if (investmentReadiness?.ready) {
        steps.push({
            message: investmentReadiness.message,
            action: "investing",
            priority: 3,
            timeline: "ongoing"
        });
    }
    
    // Retirement Planning
    const retirementReadiness = analyzeRetirementReadiness(scoreBreakdown, userStats.age);
    if (retirementReadiness?.status === 'critical') {
        steps.push({
            message: "Increase retirement contributions to 15% of income. Start with 401(k) match, then IRA.",
            action: "retirement-planning",
            priority: 2,
            timeline: "immediate"
        });
    }
    
    // Return the highest priority action
    return steps.length > 0 
        ? steps.sort((a, b) => a.priority - b.priority)[0]
        : { message: "Continue building your emergency fund and investing regularly.", action: "foundation", timeline: "ongoing" };
};

// -------------------------------------------------------- Function 4 Getting Comprehensive Financial Analysis.
export const getComprehensiveAnalysis = (scoreBreakdown, userStats = {}) => {
    const positive = getPersonalizedPositiveInsights(scoreBreakdown, userStats);
    const growth = getPersonalizedGrowthAreas(scoreBreakdown, userStats);
    const actions = getPersonalizedActionSteps(scoreBreakdown, userStats);
    
    // Additional specialized insights
    const debtToIncome = analyzeDebtToIncome(userStats.monthlyIncome, scoreBreakdown?.liabilities?.value);
    const investmentReadiness = analyzeInvestmentReadiness(scoreBreakdown, userStats.monthlyIncome);
    const retirementReadiness = analyzeRetirementReadiness(scoreBreakdown, userStats.age);
    
    return {
        positive,
        growth,
        actions,
        debtToIncome,
        investmentReadiness,
        retirementReadiness,
        overallHealth: scoreBreakdown?.score || 0
    };
};

// Export all functions
export default {
    getPersonalizedPositiveInsights,
    getPersonalizedGrowthAreas,
    getPersonalizedActionSteps,
    getComprehensiveAnalysis,
    formatCurrency
};
