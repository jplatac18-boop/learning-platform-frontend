export interface Comment {
  id: number;
  user: number;
  course: number | null;
  lesson: number | null;
  texto: string;
  fecha: string; 
}

export interface CourseRating {
  id: number;
  user: number;
  course: number;
  rating: number; 
  fecha: string;  
}

export interface RatingSummary {
  course_id: number;
  avg_rating: number | null;
  ratings_count: number;
}
