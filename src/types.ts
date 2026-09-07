export interface ProjectFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export interface ArduinoProject {
  id: string;
  number: string;
  title: string;
  folderName: string;
  tagline: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Fun for All';
  sensorUsed: string;
  status: 'Ready to Flash' | 'Planned';
  description: string;
  basedOnUrl?: string;
  files: ProjectFile[];
}

export interface PinConnection {
  component: string;
  pin: string;
  arduinoPin: string;
  color: string;
  type: 'Power' | 'Ground' | 'Digital IO' | 'PWM' | 'Analog';
  notes: string;
}
