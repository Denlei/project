document.addEventListener('DOMContentLoaded', () => {
    const weatherDataDiv = document.getElementById('weather-data');
    const newsDataDiv = document.getElementById('news-data');
    const locationsDropdown = document.getElementById('locations');

    
    const countryCapitalMap = {
        "Australia": "Canberra",
        "China": "Beijing",
        "India": "New Delhi",
        "Japan": "Tokyo",
        "South Korea": "Seoul",
        "Indonesia": "Jakarta",
        "Malaysia": "Kuala Lumpur",
        "New Zealand": "Wellington",
        "Philippines": "Manila",
        "Singapore": "Singapore",
        "Thailand": "Bangkok",
        "Vietnam": "Hanoi"
    };

    function capitalizeFirstLetterOfEachWord(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    function displayWeather(data) {
        const { temp, weather, forecast } = data;

        let weatherHtml = `
            <p>Temperature: ${temp}°C</p>
            <p>Weather: ${capitalizeFirstLetterOfEachWord(weather)}</p>
        `;

        if (forecast && forecast.length > 0) {
            weatherHtml += '<h3>Weekly Forecast</h3>';
            weatherHtml += '<div class="weekly-forecast">';
            forecast.forEach(day => {
                weatherHtml += `
                    <div class="forecast-item">
                        <p><strong>${day.day}</strong></p>
                        <p>Temperature: ${day.temp}°C</p>
                        <p>Weather: ${capitalizeFirstLetterOfEachWord(day.weather)}</p>
                    </div>
                `;
            });
            weatherHtml += '</div>';
        }

        weatherDataDiv.innerHTML = weatherHtml;
    }

    function displayNews(localArticles) {
        const filterArticlesWithImages = (articles) => {
            return articles.filter(article => article.urlToImage);
        };

        const createArticleHtml = (article) => {
            return `
                <div class="news-article">
                    <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
                    ${article.description ? `<p>${article.description}</p>` : ''}
                    <img src="${article.urlToImage}" alt="${article.title} image">
                    <p>Published on: ${new Date(article.publishedAt).toLocaleString()}</p>
                    <p>Source: ${article.source.name}</p>
                </div>
            `;
        };

        const localNewsHtml = filterArticlesWithImages(localArticles).map(createArticleHtml).join('');

        newsDataDiv.innerHTML = localNewsHtml;
    }

    async function fetchWithRetry(url, retries = 3, delay = 3000) {
        for (let i = 0; i < retries; i++) {
            const response = await fetch(url);
            if (response.ok) {
                return await response.json();
            } else if (response.status === 429 && i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw new Error(`Request failed with status ${response.status}`);
            }
        }
    }

    async function fetchWeatherData(location) {
        try {
            const weatherData = await fetchWithRetry(`https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=987aee4e091d8eca75e5293553f6490c&units=metric`);
            const formattedData = formatWeatherData(weatherData);
            displayWeather(formattedData);
        } catch (error) {
            weatherDataDiv.innerHTML = `<p>Error fetching weather data: ${error.message}</p>`;
        }
    }

    function formatWeatherData(data) {
        const currentWeather = data.list[0];
        const currentTemp = currentWeather.main.temp;
        const currentWeatherDesc = currentWeather.weather[0].description;

        
        const weeklyForecast = [];
        let currentDate = null;
        data.list.forEach(weatherItem => {
            const itemDate = new Date(weatherItem.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' });
            if (currentDate !== itemDate && new Date(weatherItem.dt * 1000).getHours() === 12) {
                weeklyForecast.push({
                    day: itemDate,
                    temp: weatherItem.main.temp,
                    weather: weatherItem.weather[0].description
                });
                currentDate = itemDate;
            }
        });

        return {
            temp: currentTemp,
            weather: currentWeatherDesc,
            forecast: weeklyForecast
        };
    }

    async function fetchNewsData(country) {
        try {
            
            const localNewsData = await fetchWithRetry(`https://newsapi.org/v2/everything?q=${country}&apiKey=ee87bf38206f4de8bd380ab3c2fd46ca`);

            
            displayNews(localNewsData.articles);
        } catch (error) {
            newsDataDiv.innerHTML = `<p>Error fetching news data: ${error.message}</p>`;
        }
    }

    locationsDropdown.addEventListener('change', () => {
        const selectedCountry = locationsDropdown.value;
        const capitalCity = countryCapitalMap[selectedCountry];
        fetchWeatherData(capitalCity);
        fetchNewsData(selectedCountry);
    });


    const defaultCountry = locationsDropdown.value;
    const defaultCapitalCity = countryCapitalMap[defaultCountry];
    fetchWeatherData(defaultCapitalCity);
    fetchNewsData(defaultCountry);
});
