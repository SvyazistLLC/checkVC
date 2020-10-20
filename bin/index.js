#!/usr/bin/env node

const util = require("util");
const snmp = require("net-snmp");
const configs = require("../config.json");

const {
  OIDS,
  THRESHOLD,
  HOURS: [hourStart, hourStop],
  IP,
  COMMUNITY,
} = configs;

const totalCount = OIDS.length * 30;

const isTimeInterval = (start, stop) => {
  const currentTime = new Date();
  const hour = currentTime.getHours();
  return hour >= start && hour < stop;
};

var session = snmp.createSession(IP, COMMUNITY, {
  version: snmp.Version2,
});

const getSnmp = util.promisify(session.get.bind(session));

const totalFreeCounts = (values) =>
  values.map(({ value }) => value).reduce((acc, value) => acc + value);

const main = async () => {
  try {
    if (!isTimeInterval(hourStart, hourStop)) {
      console.log(1);
      return;
    }

    const count = totalCount - totalFreeCounts(await getSnmp(OIDS));

    console.log(count > THRESHOLD ? 1 : 0);
  } catch (e) {
    console.error(e);
  }
};

main();
