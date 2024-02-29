import { useState, useEffect } from "react";
import Icon from "react-icons-kit";
import { arrowUp } from "react-icons-kit/feather/arrowUp";
import { arrowDown } from "react-icons-kit/feather/arrowDown";
import { droplet } from "react-icons-kit/feather/droplet";
import { wind } from "react-icons-kit/feather/wind";
import { activity } from "react-icons-kit/feather/activity";
import { useDispatch, useSelector } from "react-redux";
import { get5DaysForecast, getCityData } from "./Store/WeatherSlice.js";
import { SphereSpinner } from "react-spinners-kit";

function App() {
  const {
    citySearchLoading,
    citySearchData,
    forecastLoading,
    forecastData,
    forecastError,
  } = useSelector((state) => state.weather);

  const [loadings, setLoadings] = useState(true);
  const allLoadings = [citySearchLoading, forecastLoading];
  const [city, setCity] = useState("");
  const [unit, setUnit] = useState("metric");
  const [background, setBackground] = useState("Fergana");
  const dispatch = useDispatch();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=f49653e026f6bd0c4262ce24fd7466ae`
      )
        .then((response) => response.json())
        .then((data) => {
          const city = data.name;
          fetchData(city);
        })
        .catch((error) => {
          console.error("Error fetching current city:", error);
        });
    });
  }, []);

  useEffect(() => {
    const isAnyChildLoading = allLoadings.some((state) => state);
    setLoadings(isAnyChildLoading);
  }, [allLoadings]);

  const fetchData = (city) => {
    dispatch(
      getCityData({
        city,
        unit,
      })
    ).then((res) => {
      if (!res.payload.error) {
        dispatch(
          get5DaysForecast({
            lat: res.payload.data.coord.lat,
            lon: res.payload.data.coord.lon,
            unit,
          })
        );
      }
    });
  };

  useEffect(() => {
    fetchData(city);
  }, [unit]);

  const handleCitySearch = (e) => {
    e.preventDefault();
    setLoadings(true);
    fetchData(city);
    setBackground(city);
  };

  const filterForecastByFirstObjTime = (forecastData) => {
    if (!forecastData) {
      return [];
    }
    const firstObjTime = forecastData[0].dt_txt.split(" ")[1];
    return forecastData.filter((data) => data.dt_txt.endsWith(firstObjTime));
  };

  const filteredForecast = filterForecastByFirstObjTime(forecastData?.list);
  return (
    <div
      className="background">
      <div className="box">
        <form className="form" autoComplete="off" onSubmit={handleCitySearch}>
          <div className="container">
            <div className="search-container">
              <input value={city} onChange={(e) => setCity(e.target.value)} readOnly={loadings} className="input" type="text" />
              <svg viewBox="0 0 24 24" className="search__icon">
                <g>
                  <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z">
                  </path>
                </g>
              </svg>
            </div>
          </div>
        </form>

        <div className="current-weather-details-box">
          <div className="details-box-header">
            <h4>Current Weather</h4>
          </div>
          {loadings ? (
            <div className="loader">
              <SphereSpinner loadings={loadings} color="#2fa5ed" size={20} />
            </div>
          ) : (
            <>
              {citySearchData && citySearchData.error ? (
                <div className="error-msg">{citySearchData.error}</div>
              ) : (
                <>
                  {forecastError ? (
                    <div className="error-msg">{forecastError}</div>
                  ) : (
                    <>
                      {citySearchData && citySearchData.data ? (
                        <div className="weather-details-container">
                          {/* details */}
                          <div className="details">
                            <h4 className="city-name">
                              {citySearchData.data.name}
                            </h4>

                            <div className="icon-and-temp">
                              <img
                                src={`https://openweathermap.org/img/wn/${citySearchData.data.weather[0].icon}@2x.png`}
                                alt="icon"
                              />
                              <h1>{citySearchData.data.main.temp}&deg;</h1>
                            </div>

                            <h4 className="description">
                              {citySearchData.data.weather[0].description}
                            </h4>
                          </div>

                          {/* metrices */}
                          <div className="metrices">
                            {/* feels like */}
                            <h4>
                              Feels like {citySearchData.data.main.feels_like}
                              &deg;C
                            </h4>

                            {/* min max temp */}
                            <div className="key-value-box">
                              <div className="key">
                                <Icon
                                  icon={arrowUp}
                                  size={20}
                                  className="icon"
                                />
                                <span className="value">
                                  {citySearchData.data.main.temp_max}
                                  &deg;C
                                </span>
                              </div>
                              <div className="key">
                                <Icon
                                  icon={arrowDown}
                                  size={20}
                                  className="icon"
                                />
                                <span className="value">
                                  {citySearchData.data.main.temp_min}
                                  &deg;C
                                </span>
                              </div>
                            </div>

                            {/* humidity */}
                            <div className="key-value-box">
                              <div className="key">
                                <Icon
                                  icon={droplet}
                                  size={20}
                                  className="icon"
                                />
                                <span>Humidity</span>
                              </div>
                              <div className="value">
                                <span>
                                  {citySearchData.data.main.humidity}%
                                </span>
                              </div>
                            </div>

                            {/* wind */}
                            <div className="key-value-box">
                              <div className="key">
                                <Icon icon={wind} size={20} className="icon" />
                                <span>Wind</span>
                              </div>
                              <div className="value">
                                <span>{citySearchData.data.wind.speed}kph</span>
                              </div>
                            </div>

                            {/* pressure */}
                            <div className="key-value-box">
                              <div className="key">
                                <Icon
                                  icon={activity}
                                  size={20}
                                  className="icon"
                                />
                                <span>Pressure</span>
                              </div>
                              <div className="value">
                                <span>
                                  {citySearchData.data.main.pressure}
                                  hPa
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="error-msg">No Data Found</div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
