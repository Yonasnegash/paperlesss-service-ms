import { sendSmsEvent } from '../lib/kafkaProducer.ts';

const sendMessage = async (phoneNumber: string, content: string): Promise<void> => {
  try {
    await sendSmsEvent(phoneNumber, content);
  } catch (error: any) {
    console.log(`Error sending SMS event to ${phoneNumber}:`, error.message);
  }
};

export default sendMessage;
