import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
    ChartData
} from 'chart.js';
import styles from './BarChart.module.css';

// 1. Externalize constants to prevent re-creation
import { BAR_COLOR_PALETTE, BAR_HOVER_COLOR_PALETTE, COLORS } from '../chartConfig';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
    dataObject: Record<string, number>;
    title?: string;
    orientation?: 'vertical' | 'horizontal';
    height?: string | number;
}

const BarChart: React.FC<BarChartProps> = ({
                                               dataObject,
                                               title = 'Data Distribution',
                                               orientation = 'vertical',
                                               height = 400
                                           }) => {

    // 2. Memoize data to prevent unnecessary re-renders
    const chartData: ChartData<'bar'> = useMemo(() => {
        const labels = Object.keys(dataObject);
        const dataValues = Object.values(dataObject);

        return {
            labels,
            datasets: [
                {
                    label: 'Count',
                    data: dataValues,
                    backgroundColor: labels.map((_, i) => BAR_COLOR_PALETTE[i % BAR_COLOR_PALETTE.length]),
                    hoverBackgroundColor: labels.map((_, i) => BAR_HOVER_COLOR_PALETTE[i % BAR_HOVER_COLOR_PALETTE.length]),
                    borderColor: '#ffffff',
                    borderWidth: 1,
                    borderRadius: 4,
                },
            ],
        };
    }, [dataObject]);

    // 3. Memoize options
    const options: ChartOptions<'bar'> = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: orientation === 'horizontal' ? 'y' : 'x',
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: title,
                color: COLORS.TEXT_PRIMARY,
                font: { size: 16, weight: 'bold' }
            },
            tooltip: {
                backgroundColor: COLORS.PRIMARY_DARKER,
                padding: 12,
                cornerRadius: 6,
            }
        },
        scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true }
        }
    }), [title, orientation]);

    return (
        <div className={styles.chartContainer} style={{ height }}>
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default BarChart;