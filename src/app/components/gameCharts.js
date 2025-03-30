"use client"
import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

export default function GameCharts({ games, priceCategories }) {
  const priceChartRef = useRef(null);
  const genreChartRef = useRef(null);
  const completionChartRef = useRef(null);
  
  // Register Chart.js components
  useEffect(() => {
    Chart.register(...registerables);
  }, []);

  // Price Distribution Chart
  useEffect(() => {
    if (!games.length) return;
    
    const ctx = priceChartRef.current.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Cheap', 'Average', 'Expensive'],
        datasets: [{
          data: [
            priceCategories.cheap.length,
            priceCategories.average.length,
            priceCategories.expensive.length
          ],
          backgroundColor: [
            '#4CAF50',
            '#FFC107',
            '#F44336'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Price Distribution'
          }
        }
      }
    });

    return () => chart.destroy();
  }, [games, priceCategories]);

  // Genre Distribution Chart
  useEffect(() => {
    if (!games.length) return;
    
    const genreCounts = {};
    games.forEach(game => {
      game.tags?.forEach(tag => {
        genreCounts[tag] = (genreCounts[tag] || 0) + 1;
      });
    });

    const ctx = genreChartRef.current.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(genreCounts),
        datasets: [{
          label: 'Games per Genre',
          data: Object.values(genreCounts),
          backgroundColor: '#2196F3'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Genre Distribution'
          }
        }
      }
    });

    return () => chart.destroy();
  }, [games]);

  // Completion Status Chart
  useEffect(() => {
    if (!games.length) return;
    
    const ctx = completionChartRef.current.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Completed', 'In Progress', 'Not Started'],
        datasets: [{
          data: [10, 5, games.length - 15], // Example data
          backgroundColor: [
            '#9C27B0',
            '#3F51B5',
            '#607D8B'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Completion Status'
          }
        }
      }
    });

    return () => chart.destroy();
  }, [games]);

  return (
    <div className="charts-container">
      <div className="chart-wrapper">
        <canvas ref={priceChartRef}></canvas>
      </div>
      <div className="chart-wrapper">
        <canvas ref={genreChartRef}></canvas>
      </div>
      <div className="chart-wrapper">
        <canvas ref={completionChartRef}></canvas>
      </div>
    </div>
  );
}