import { Kafka, Partitioners } from "kafkajs";

let producer: any;
let isConnected = false;

export const connectProducer = async () => {
  if (isConnected) return producer;

const kafka = new Kafka({
  clientId: 'paperless-notification-producer',
  brokers: [global._CONFIG.KAFKA_ADDRESS],
});

  producer = kafka.producer({
    createPartitioner: Partitioners.DefaultPartitioner,
  });

  try {
    await producer.connect();
    isConnected = true;
    console.log("✅ Kafka producer connected.");
    return producer;
  } catch (err: any) {
    console.error(`❌ Error connecting Kafka producer: ${err.message}`);
    setTimeout(connectProducer, 5000);
  }
};

export const sendSmsEvent = async (phoneNumber: string, message: string) => {
  if (!isConnected) {
    await connectProducer();
  }

  await producer.send({
    topic: "sms-topic",
    messages: [{ value: JSON.stringify({ phoneNumber, message }) }],
  });
};
