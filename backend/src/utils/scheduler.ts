import { flushDataToMongo } from "../services/flushService";

const FLUSH_INTERVAL_MINUTES = 10;

export const startScheduler = () => {
  const scheduleNextFlush = () => {
    const now = new Date();
    const minutesToWait =
      FLUSH_INTERVAL_MINUTES - (now.getMinutes() % FLUSH_INTERVAL_MINUTES);

    let msUntilNextFlush =
      minutesToWait * 60 * 1000 -
      now.getSeconds() * 1000 -
      now.getMilliseconds();

    if (msUntilNextFlush <= 0 || msUntilNextFlush > 2147483647) {
      msUntilNextFlush = 60 * 1000;
    }

    console.log(
      `Scheduler: Next flush in ${(msUntilNextFlush / 1000 / 60).toFixed(
        2
      )} minutes`
    );

    setTimeout(() => {
      flushDataToMongo();
      scheduleNextFlush();
    }, msUntilNextFlush);
  };

  scheduleNextFlush();
  console.log("Scheduler Started");
};
