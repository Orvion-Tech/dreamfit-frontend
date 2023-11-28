import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
@Component({
  selector: 'app-trend',
  templateUrl: './trend.component.html',
  styleUrls: ['./trend.component.scss'],
})
export class TrendComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    this.createChart();
  }
  public chart: unknown;
  public chart2: unknown;

  createChart() {
    this.chart = new Chart('MyChart', {
      type: 'line', //this denotes tha type of chart

      data: {
        // values on X-Axis
        labels: ['day 1', 'day 5', 'day 10', 'day 15', 'day 20', 'day 25', 'day 30'],
        datasets: [
          {
            label: 'Fat %',
            data: ['25', '50', '75', '200', '125', '150', '100'],
            backgroundColor: '#224DEB',
            borderColor: '#224DEB',
            yAxisID: 'y',
          },
          {
            label: 'Weight (kg)',
            data: ['50', '52', '54', '50', '58', '56', '52'],
            backgroundColor: '#ED7D31',
            borderColor: '#ED7D31',
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },

        scales: {
          y: {
            type: 'linear',
            // display: true,
            position: 'left',
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',

            // grid line settings
            grid: {
              drawOnChartArea: false, // only want the grid lines for one axis to show up
            },
          },
        },
      },
    });
    this.chart2 = new Chart('MyChart2', {
      type: 'line', //this denotes tha type of chart

      data: {
        // values on X-Axis
        labels: ['day 1', 'day 5', 'day 10', 'day 15', 'day 20', 'day 25', 'day 30'],
        datasets: [
          {
            label: 'Fat %',
            data: ['25', '50', '75', '200', '125', '150', '100'],
            backgroundColor: '#224DEB',
            borderColor: '#224DEB',
            yAxisID: 'y',
          },
          {
            label: 'Weight (kg)',
            data: ['50', '52', '54', '50', '58', '56', '52'],
            backgroundColor: '#ED7D31',
            borderColor: '#ED7D31',
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },

        scales: {
          y: {
            type: 'linear',
            // display: true,
            position: 'left',
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',

            // grid line settings
            grid: {
              drawOnChartArea: false, // only want the grid lines for one axis to show up
            },
          },
        },
      },
    });
  }
}
