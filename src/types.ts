export type Role = 'user' | 'model';

export interface Message {
  id: string;
  role: Role;
  text: string;
}

export interface ChatRequest {
  messages: Omit<Message, 'id'>[];
  knowledgeBase: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  propertyInterest: string;
  budget: string;
  priority?: 'High' | 'Medium' | 'Low';
  status: 'New' | 'Contacted' | 'Site Visit' | 'Booked' | 'Lost';
  timestamp: string;
}
