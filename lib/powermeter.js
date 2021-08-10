const config = require('./config');
const Influx = require('influx');

const ADCDifferentialPi = require("./adc/adcdifferentialpi");
const ADCPi = require("./adc/adcpi");

let adcDiff = new ADCDifferentialPi(
    config.adcDiff.address1,
    config.adcDiff.address2,
    config.adcDiff.bitRate);

let adc = new ADCPi(config.adc.address1,
    config.adc.address2,
    config.adc.bitRate);

const influx = new Influx.InfluxDB({
    host: config.influx.host,
    database: config.influx.database,
    schema: [
        {
            measurement: 'power_consumption',
            fields: { watts: Influx.FieldType.FLOAT },
            tags: ['host']
        }
    ]
});

let taskId = -1;
process.on('SIGINT', function() {
    console.log("Shutting down the power meter...");
    clearInterval(taskId);
    process.exit();
});

function measurePower(channel, resistance, refChannel) {
    let refV = adc.readVoltage(refChannel);
    return (adcDiff.readVoltage(channel) * refV) / resistance;
}

let measurements = [];
let batchSize = config.monitor.batch_size;
influx.getDatabaseNames()
    .then(names => {
        if (!names.includes(config.influx.database)) {
           return influx.createDatabase(config.influx.database);
        }
    })
    .then(() => {
        let retentionPolicy = config.influx.retention_policy;
        return influx.createRetentionPolicy(retentionPolicy, {
            database: config.influx.database,
            duration: retentionPolicy,
            replication: 1});
    })
    .then(() => {
        console.log(`Monitoring the power consumption...`);
        let refChannel = config.adc.refChannel;
        taskId = setInterval(() => {
            let now = new Date();

            for (const device of config.monitor.devices) {
                let power = measurePower(device.channel, device.resistance, refChannel);
                measurements.push({
                    timestamp: now,
                    tags: {host: device.id},
                    fields: {watts: power}
                });
            }

            if (measurements.length >= batchSize) {
                influx
                    .writeMeasurement('power_consumption', measurements)
                    .catch((err) => {
                        console.error(`Error saving data to InfluxDB: ${err.stack}`);
                    });
                measurements = [];
            }
        }, config.monitor.interval);
    })
    .catch(error => console.log({ error }));
