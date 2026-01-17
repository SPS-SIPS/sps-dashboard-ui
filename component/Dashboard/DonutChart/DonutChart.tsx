import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    ChartOptions,
    ChartData,
    TooltipItem,
} from 'chart.js';
import { COLORS, BAR_COLOR_PALETTE, BAR_HOVER_COLOR_PALETTE, CHART_FONTS } from '../chartConfig';
import styles from './DonutChart.module.css';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutChartProps {
    dataObject: Record<string, number>;
    title: string;
    height?: string | number;
}

const DonutChart: React.FC<DonutChartProps> = ({
                                                   dataObject,
                                                   title,
                                                   height
                                               }) => {
    // 1. Calculate Dynamic Total
    const totalCount = useMemo(() => {
        return Object.values(dataObject).reduce((acc, val) => acc + val, 0);
    }, [dataObject]);

    const chartData: ChartData<'doughnut'> = useMemo(() => {
        const labels = Object.keys(dataObject);
        const dataValues = Object.values(dataObject);

        return {
            labels,
            datasets: [
                {
                    data: dataValues,
                    backgroundColor: labels.map((_, i) => BAR_COLOR_PALETTE[i % BAR_COLOR_PALETTE.length]),
                    hoverBackgroundColor: labels.map((_, i) => BAR_HOVER_COLOR_PALETTE[i % BAR_HOVER_COLOR_PALETTE.length]),
                    borderWidth: 2,
                    borderColor: COLORS.WHITE,
                    hoverOffset: 10,
                },
            ],
        };
    }, [dataObject]);

    const options: ChartOptions<'doughnut'> = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: COLORS.TEXT_SECONDARY,
                    usePointStyle: true,
                    padding: 20, // Space between legend and chart
                    font: {
                        family: CHART_FONTS.family,
                        size: 12,
                    }
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context: TooltipItem<'doughnut'>) {
                        const label = context.label || '';
                        const value = context.parsed as number;
                        const percentage = totalCount > 0 ? ((value / totalCount) * 100).toFixed(1) + '%' : '0%';
                        return ` ${label}: ${value.toLocaleString()} (${percentage})`;
                    },
                },
                backgroundColor: COLORS.PRIMARY_DARKER,
                padding: 12,
                cornerRadius: 8,
            },
        },
        cutout: '75%', // Thinner ring looks more modern
    }), [totalCount]);

    return (
        <div className={styles.container} style={{ height }}>
            <h4 className={styles.title}>{title}</h4>
            <div className={styles.canvasWrapper}>
                <Doughnut data={chartData} options={options} />
                <div className={styles.centerLabel}>
                    <span className={styles.centerValue}>
                        {totalCount > 999999 ? `${(totalCount / 1000000).toFixed(1)}M` : totalCount.toLocaleString()}
                    </span>
                    <span className={styles.centerText}>Total</span>
                </div>
            </div>
        </div>
    );
};

export default DonutChart;