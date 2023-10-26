require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const { WeatherService } = require('./weather.service');

const bot = new TelegramBot(process.env.TG_API_TOKEN, { polling: true });
const weatherService = new WeatherService();

const CustomCommand = {
  LOCAL: '/local_weather',
  CITY: '/city_weather',
};

bot.setMyCommands([
  {
    command: CustomCommand.LOCAL,
    description: 'Get weather at your current location.',
  },
  {
    command: CustomCommand.CITY,
    description: 'Get weather in a given city.',
  },
]);

const replyWithWeather = (chatId, weather) => {
  if (weather.error) {
    return bot.sendMessage(chatId, weather.message);
  }

  let caption = `Weather in ${weather.city}, ${weather.country}\n\n`;

  for (const weatherItem of weather.data) {
    caption += `${weatherItem.text}: ${weatherItem.value}\n`;
  }

  bot.sendPhoto(chatId, weather.icon, { caption });
};

bot.on('message', async (message) => {
  const chatId = message.chat.id;
  const text = message.text;

  if (text?.startsWith(CustomCommand.CITY)) {
    const city = text.replace(CustomCommand.CITY, '');
    if (!city) {
      return bot.sendMessage(
        chatId,
        'Please provide a city name after the command.'
      );
    }

    const weather = await weatherService.getWeatherByCity(city);
    return replyWithWeather(chatId, weather);
  }

  if (text?.startsWith(CustomCommand.LOCAL)) {
    const request = {
      reply_markup: {
        keyboard: [
          [
            {
              text: 'Share Location',
              request_location: true,
            },
          ],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    };

    bot.sendMessage(chatId, 'Please share your location:', request);
  }

  if (message.location) {
    const { latitude, longitude } = message.location;
    const weather = await weatherService.getWeatherByGeolocation(
      latitude,
      longitude
    );
    return replyWithWeather(chatId, weather);
  }
});
