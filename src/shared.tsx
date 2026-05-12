export interface Event {
  name: string;
  batteryCheckSlideNumber: number;
  surveySlideNumber: number;
  countdownTimer: number;
  pdfUrl: string;
  date: string;
  isActive: boolean;
  moreInfo: string;
  sessionDuration: number;
}

export interface ResponseEvent extends Event {
  id: number;
}

export const generatePresentationLink = (eventName: string) => {
  const domain = process.env.NEXT_PUBLIC_EVENT_PRESENTATION_URL;
  return `${domain}${eventName}`;
}