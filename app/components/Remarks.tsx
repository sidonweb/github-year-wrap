import React from 'react';
import { Sparkles, TrendingUp, Coffee, Flame, Target, Zap, Trophy, Star } from 'lucide-react';

interface RemarksProps {
    totalCommits: number;
    totalPRs: number;
    mostActiveDayOfWeek: string;
    peakCommitsInDay: number;
    languages: Array<{ name: string; count: number }>;
    totalStars: number;
}

const Remarks: React.FC<RemarksProps> = ({
    totalCommits,
    totalPRs,
    mostActiveDayOfWeek,
    peakCommitsInDay,
    languages,
    totalStars,
}) => {
    const getMainRemark = () => {
        if (totalCommits === 0) {
            return {
                icon: Coffee,
                title: "Taking it Easy in 2025? 🌴",
                message: "Looks like you're on a coding vacation! No commits yet, but hey, planning is half the battle.",
                suggestion: "Start small! Commit to one small project this week. Even 'Hello World' counts!",
                mood: "chill",
            };
        }

        if (totalCommits < 50) {
            return {
                icon: Sparkles,
                title: "Getting Warmed Up! 🔥",
                message: `You've made ${totalCommits} commits. That's a solid start to the year!`,
                suggestion: "Set a goal to code 3 times a week. Consistency beats intensity!",
                mood: "starter",
            };
        }

        if (totalCommits < 100) {
            return {
                icon: TrendingUp,
                title: "Momentum Building! 🚀",
                message: `${totalCommits} commits and counting! You're getting into a good rhythm.`,
                suggestion: "Try contributing to an open-source project. It's a great way to learn and give back!",
                mood: "growing",
            };
        }

        if (totalCommits < 250) {
            return {
                icon: Flame,
                title: "On Fire! 🔥",
                message: `Damn! ${totalCommits} commits this year. You're absolutely crushing it!`,
                suggestion: "Document your journey! Start a dev blog or share your learnings on Twitter/LinkedIn.",
                mood: "hot",
            };
        }

        if (totalCommits < 500) {
            return {
                icon: Trophy,
                title: "Coding Machine! 💪",
                message: `${totalCommits} commits?! You're a productivity beast. Seriously impressive dedication.`,
                suggestion: "Time to level up! Try learning a new tech stack or building something ambitious.",
                mood: "beast",
            };
        }

        return {
            icon: Zap,
            title: "ABSOLUTE LEGEND! ⚡",
            message: `${totalCommits} commits... Are you even human?! This is next-level commitment to the craft.`,
            suggestion: "You're already elite. Maybe mentor others or create content to share your expertise!",
            mood: "legend",
        };
    };

    const getActivityInsight = () => {
        const insights = [];

        if (peakCommitsInDay > 20) {
            insights.push({
                icon: Target,
                text: `Your peak day had ${peakCommitsInDay} commits. That's some serious focus! Just remember to take breaks.`,
            });
        } else if (peakCommitsInDay > 10) {
            insights.push({
                icon: Target,
                text: `Peak day: ${peakCommitsInDay} commits. You know how to get in the zone!`,
            });
        }

        if (mostActiveDayOfWeek === 'Saturday' || mostActiveDayOfWeek === 'Sunday') {
            insights.push({
                icon: Coffee,
                text: `You code most on ${mostActiveDayOfWeek}s. Weekend warrior vibes! 💪`,
            });
        } else if (mostActiveDayOfWeek === 'Friday') {
            insights.push({
                icon: Coffee,
                text: `Fridays are your jam! Who needs TGIF when you're shipping code? 🎉`,
            });
        } else {
            insights.push({
                icon: Coffee,
                text: `${mostActiveDayOfWeek}s are your power day. Keep that rhythm going!`,
            });
        }

        if (totalPRs > 50) {
            insights.push({
                icon: Star,
                text: `${totalPRs} pull requests! You're a collaboration champion. Teams love working with you.`,
            });
        } else if (totalPRs > 20) {
            insights.push({
                icon: Star,
                text: `${totalPRs} PRs shows you're a team player. Keep that collaborative energy!`,
            });
        } else if (totalPRs < 5 && totalCommits > 50) {
            insights.push({
                icon: Star,
                text: `You're coding a lot but not many PRs. Maybe try collaborating more or contributing to open source?`,
            });
        }

        if (languages.length >= 5) {
            insights.push({
                icon: Sparkles,
                text: `${languages.length} languages! You're a true polyglot programmer. Versatility is your superpower.`,
            });
        } else if (languages.length === 1) {
            insights.push({
                icon: Sparkles,
                text: `Focused on ${languages[0]?.name}. Deep expertise in one language is powerful! Consider expanding your toolkit though.`,
            });
        }

        if (totalStars > 100) {
            insights.push({
                icon: Trophy,
                text: `${totalStars} stars earned! People love your work. You're making an impact! ⭐`,
            });
        }

        return insights;
    };

    const mainRemark = getMainRemark();
    const insights = getActivityInsight();
    const MainIcon = mainRemark.icon;

    const moodColors = {
        chill: 'bg-blue-400',
        starter: 'bg-green-400',
        growing: 'bg-yellow-400',
        hot: 'bg-orange-400',
        beast: 'bg-red-400',
        legend: 'bg-purple-400',
    };

    return (
        <div className="space-y-6">
            {/* Main Remark */}
            <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">

                <div className='flex flex-col md:flex-row gap-4 justify-start items-start'>
                    <div className={`${moodColors[mainRemark.mood]} p-3 border-4 border-black`}>
                        <MainIcon className="w-8 h-8 text-black" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-2xl font-black mb-2 uppercase">{mainRemark.title}</h3>
                        <p className="text-lg font-bold mb-4">{mainRemark.message}</p>

                    </div>
                </div>

                <div className="bg-yellow-200 border-4 border-black p-4">
                    <p className="font-black text-sm uppercase mb-1">💡 What's Next?</p>
                    <p className="font-bold">{mainRemark.suggestion}</p>
                </div>

            </div>

            {/* Insights */}
            {insights.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-xl font-black uppercase">Quick Insights</h4>
                    {insights.map((insight, index) => {
                        const InsightIcon = insight.icon;
                        return (
                            <div
                                key={index}
                                className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex items-start gap-3"
                            >
                                <InsightIcon className="w-5 h-5 mt-1 shrink-0" />
                                <p className="font-bold">{insight.text}</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Fun Fact */}
            <div className="border-4 border-black bg-lime-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                <p className="font-black text-sm uppercase mb-2">🎯 Fun Fact</p>
                <p className="font-bold">
                    {totalCommits > 0
                        ? `If each commit took 30 minutes, you've spent ${Math.round((totalCommits * 30) / 60)} hours coding this year. That's ${Math.round((totalCommits * 30) / 60 / 24)} days of pure development time! ⏰`
                        : "Every expert was once a beginner. Your first commit is just a decision away! 🚀"}
                </p>
            </div>
        </div>
    );
};

export default Remarks;