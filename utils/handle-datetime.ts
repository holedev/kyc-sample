const handleDatetime = (datetime: Date, showDetailsTime = false) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric"
  };

  if (showDetailsTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
    options.second = "2-digit";
  }

  return datetime.toLocaleString("vi-VN", options);
};

const getRandomPastelColor = () => {
  const _maxHue = 360;
  const hue = Math.floor(Math.random() * _maxHue);
  return `hsl(${hue}, 70%, 80%)`;
};

export { getRandomPastelColor, handleDatetime };
