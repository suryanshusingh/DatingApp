import { Photo } from './photo';

export interface User {
    id: number;
    username: string;
    gender: string;
    age: number;
    knownAs: string;
    created: Date;
    lastActive: Date;
    city: string;
    country: string;
    photoUrl: Photo;
    interests?: string;
    introduction?: string;
    lookingFor?: string;
    photos?: Photo[];
}
