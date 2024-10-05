import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    RadarController,
    DoughnutController,
    Title,
    Tooltip,
    Legend
  } from 'chart.js';
  
  // Register the necessary components globally
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    RadarController,
    DoughnutController,
    Title,
    Tooltip,
    Legend
  );
  