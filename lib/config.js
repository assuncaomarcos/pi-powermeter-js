let config = {};

config.adcDiff = {};
config.adc = {};
config.influx = {};
config.monitor = {}

// Settings for the Differential ADC used to
// measure the voltage at the extremities of each resistor
config.adcDiff.address1 = 0x6A;
config.adcDiff.address2 = 0x6B;
config.adcDiff.bitRate = 18;

// Settings for the ADC and channel used to
// measure the input voltage
config.adc.address1 = 0x68;
config.adc.address2 = 0x69;
config.adc.bitRate = 18;
config.adc.refChannel = 1;

// Configuration of the influx database server where
// the data will be saved
config.influx.host = "localhost";
config.influx.username =  process.env.INFLUX_USER || 'admin';
config.influx.password = process.env.INFLUX_PASSWORD || 'password';
config.influx.database = "power_data";
// Retention policy, the time the data will remain in the influx database.
// Check Influx' documentation for details:
// https://docs.influxdata.com/influxdb/v1.8/concepts/glossary/#retention-policy-rp
config.influx.retention_policy = '7d';

// The monitored devices, the amount in ohms of the used resistance,
// and to which channels of the differential ADC they are connected
config.monitor.devices = [
    {"id" : "rpi-1", "resistance" : 0.1, "channel" : 1},
    {"id" : "rpi-2", "resistance" : 0.1, "channel" : 4},
    {"id" : "rpi-3", "resistance" : 0.1, "channel" : 7},
];

// monitor frequency in milliseconds
config.monitor.interval = 1000;
// Minimum number of measurements to be collected before they are written to influxDB
config.monitor.batch_size = 30;

module.exports = config;
