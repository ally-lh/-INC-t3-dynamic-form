export interface Answer {
    id: string;
    questionId: string;
    answer: string;
  }
  
export interface Option {
    id: string;
    questionId: string;
    optionText: string;
    isSelected: boolean;
  }
  
export interface Question {
    id: string;
    formId: string;
    questionText: string;
    questionType: string; // e.g., 'option', 'text', 'checkbox', etc.
    isRequired: boolean;
    answer?: Answer | null | undefined; // Made optional and can be null
    options: Option[]; // Relevant only for certain question types
  }
  
export interface AnswersState {
    [key: string]: {
      answer?: Answer | null | undefined;
      selectedOptions?: Option[];
    };
  }