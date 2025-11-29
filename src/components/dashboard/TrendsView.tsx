"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { useAppStore } from "@/lib/store/AppContext";
import { Card } from "@/components/ui/Card";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export function TrendsView() {
    const { state } = useAppStore();

    // Prepare data (sort logs by date)
    const sortedDates = Object.keys(state.logs).sort();
    const last7Days = sortedDates.slice(-7); // Show last 7 entries for simplicity

    // If no data, show at least today
    const displayDates = last7Days.length > 0 ? last7Days : [new Date().toISOString().split("T")[0]];

    const weightData = {
        labels: displayDates.map(d => d.slice(5)), // MM-DD
        datasets: [
            {
                label: "体重 (kg)",
                data: displayDates.map(d => state.logs[d]?.weight || null),
                borderColor: "#ccff00", // Neon Green
                backgroundColor: "rgba(204, 255, 0, 0.1)",
                tension: 0.4,
                fill: true,
                pointBackgroundColor: "#000",
                pointBorderColor: "#ccff00",
                pointBorderWidth: 2,
            },
        ],
    };

    const volumeData = {
        labels: displayDates.map(d => d.slice(5)),
        datasets: [
            {
                label: "训练容量 (kg)",
                data: displayDates.map(d => state.logs[d]?.workoutVolume || 0),
                backgroundColor: "#ff3b30", // Red
                borderRadius: 4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: "index" as const,
                intersect: false,
                backgroundColor: "rgba(28, 28, 30, 0.9)",
                titleColor: "#fff",
                bodyColor: "#ccc",
                borderColor: "rgba(255,255,255,0.1)",
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                grid: { display: false, drawBorder: false },
                ticks: { color: "#666" },
            },
            y: {
                grid: { color: "rgba(255,255,255,0.05)", drawBorder: false },
                ticks: { color: "#666" },
            },
        },
        interaction: {
            mode: 'nearest' as const,
            axis: 'x' as const,
            intersect: false
        }
    };

    const calorieData = {
        labels: displayDates.map(d => d.slice(5)),
        datasets: [
            {
                label: "摄入 (kcal)",
                data: displayDates.map(d => state.logs[d]?.caloriesIntake || 0),
                borderColor: "#3b82f6", // Blue
                backgroundColor: "rgba(59, 130, 246, 0.5)",
                type: 'bar' as const,
            },
            {
                label: "消耗 (kcal)",
                data: displayDates.map(d => state.logs[d]?.caloriesBurned || 0),
                borderColor: "#ff3b30", // Red
                backgroundColor: "rgba(255, 59, 48, 0.5)",
                type: 'bar' as const,
            }
        ],
    };

    return (
        <div className="space-y-6 pb-20 pt-4">
            <Card>
                <h3 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider">热量平衡 (摄入 vs 消耗)</h3>
                <div className="h-64">
                    <Bar options={chartOptions} data={calorieData} />
                </div>
            </Card>

            <Card>
                <h3 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider">体重趋势</h3>
                <div className="h-64">
                    <Line options={chartOptions} data={weightData} />
                </div>
            </Card>

            <Card>
                <h3 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider">训练容量</h3>
                <div className="h-64">
                    <Bar options={chartOptions} data={volumeData} />
                </div>
            </Card>

            {sortedDates.length === 0 && (
                <div className="text-center text-zinc-500 text-sm mt-8">
                    暂无数据，请先在“基本信息”中生成模拟数据或开始记录。
                </div>
            )}
        </div>
    );
}
