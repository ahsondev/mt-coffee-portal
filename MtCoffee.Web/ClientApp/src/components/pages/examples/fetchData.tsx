import { Page } from '@pages/page';
import React, { Component } from 'react';

type Forecast = {
  date: number;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}

interface FetchDataState {
  forecasts: Forecast[];
  loading: boolean;
}

export class FetchData extends Component<any, FetchDataState> {
  static displayName = FetchData.name;

  constructor(props: any) {
    super(props);
    this.state = { forecasts: [], loading: true };
  }

  componentDidMount() {
    this.populateWeatherData();
  }

  static renderForecastsTable(forecasts: Forecast[]) {
    return (
      <table className='table table-striped' aria-labelledby="tabelLabel">
        <thead>
          <tr>
            <th>Date</th>
            <th>Temp. (C)</th>
            <th>Temp. (F)</th>
            <th>Summary</th>
          </tr>
        </thead>
        <tbody>
          {forecasts.map(forecast =>
            <tr key={forecast.date}>
              <td>{forecast.date}</td>
              <td>{forecast.temperatureC}</td>
              <td>{forecast.temperatureF}</td>
              <td>{forecast.summary}</td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }

  render() {
    const contents = this.state.loading
      ? <p><em>Loading...</em></p>
      : FetchData.renderForecastsTable(this.state.forecasts);

    return (
      <Page>
        <div>
          <h1 id="tabelLabel" >Weather forecast</h1>
          <p>This component demonstrates fetching data from the server.</p>
          {contents}
        </div>
      </Page>
    );
  }

  async populateWeatherData() {
    const response = await fetch('api/weatherforecast/index');
    const data = await response.json();
    this.setState({ forecasts: data, loading: false });
  }
}
