const axios = require('axios');

class WeatherService {
  #getIconUrl(iconName) {
    return `http://openweathermap.org/img/wn/${iconName}@4x.png`;
  }

  #getApiUrl(params) {
    const urlParams = new URLSearchParams(params).toString();
    return `https://api.openweathermap.org/data/2.5/weather?appid=${process.env.WEATHER_API_KEY}&units=metric&${urlParams}`;
  }

  #fetchWeather = async (params) => {
    try {
      const response = await axios.get(this.#getApiUrl(params));

      const data = response.data;

      const {
        main: { temp, humidity, pressure },
        sys: { country },
        name: city,
        weather: [description],
      } = data ?? {};

      return {
        icon: this.#getIconUrl(description.icon),
        city,
        country: country,
        data: [
          {
            text: '🌡 Temperature ',
            value: `${temp}°C`,
          },
          { text: '💧 Humidity', value: `${humidity}%` },
          { text: '🌪 Pressure', value: `${pressure}mbar` },
        ],
      };
    } catch (err) {
      if (err.response.data.cod === '404') {
        return { error: true, message: `🔴 Error: City not found` };
      } else {
        return {
          error: true,
          message: 'Someting went wrong. Please try again later.',
        };
      }
    }
  };

  getWeatherByCity = async (cityName) => {
    const data = await this.#fetchWeather({ q: cityName });
    return data;
  };

  getWeatherByGeolocation = async (lat, lon) => {
    const data = await this.#fetchWeather({ lat, lon });
    return data;
  };
}

module.exports = { WeatherService };
