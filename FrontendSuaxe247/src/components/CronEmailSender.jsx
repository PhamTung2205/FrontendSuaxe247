
import { useEffect } from "react";


function CronEmailSender() {
  // Thay đổi ở đây để test nhanh ("1m" | "15m" | "30m" | "1h")
  const intervalType = "1h"; 

  useEffect(() => {
    const sendReminder = async () => {
      try {
        const response = await fetch(
          "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/email/check-reminders"
        );
        const data = await response.json();
        console.log("✅ API gửi mail:", data, " - lúc:", new Date().toLocaleTimeString());
      } catch (err) {
        console.error("Lỗi khi gọi API:", err);
      }
    };

    // Tính thời gian còn lại đến mốc giờ tròn kế tiếp
    const getDelayToNextRun = () => {
      const now = new Date();
      const minutes = now.getMinutes();

      let nextRun = new Date(now);
      nextRun.setSeconds(0);
      nextRun.setMilliseconds(0);

      switch (intervalType) {
        case "15m": {
          const next = Math.ceil(minutes / 15) * 15;
          nextRun.setMinutes(next === 60 ? 0 : next);
          if (next === 60) nextRun.setHours(now.getHours() + 1);
          break;
        }
        case "30m": {
          const next = minutes < 30 ? 30 : 0;
          nextRun.setMinutes(next);
          if (minutes >= 30) nextRun.setHours(now.getHours() + 1);
          break;
        }
        case "1h": {
          nextRun.setMinutes(0);
          nextRun.setHours(now.getHours() + 1);
          break;
        }
        case "1m":
        default: {
          nextRun.setMinutes(now.getMinutes() + 1);
          break;
        }
      }

      const delay = nextRun.getTime() - now.getTime();
      console.log(
        `⏱️ Sẽ gửi mail lúc ${nextRun.toLocaleTimeString()} (sau ${(delay / 1000).toFixed(0)} giây)`
      );
      return delay;
    };

    const delay = getDelayToNextRun();

    // 🔹 Hẹn giờ gọi API lần đầu tiên vào mốc giờ tròn
    const firstTimeout = setTimeout(() => {
      sendReminder();

      // 🔁 Sau đó tiếp tục gọi định kỳ đúng khoảng cách
      let repeatInterval;
      switch (intervalType) {
        case "15m":
          repeatInterval = 15 * 60 * 1000;
          break;
        case "30m":
          repeatInterval = 30 * 60 * 1000;
          break;
        case "1h":
          repeatInterval = 60 * 60 * 1000;
          break;
        case "1m":
        default:
          repeatInterval = 60 * 1000;
      }

      const interval = setInterval(sendReminder, repeatInterval);
      console.log(`🔁 Chu kỳ gửi lại mỗi ${repeatInterval / 60000} phút`);

      // cleanup
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(firstTimeout);
  }, []);

  return null;
}

export default CronEmailSender;
