export interface QuestObject {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  dateCreated: Date;
  dateUpdated?: Date;
  dateDeleted?: Date;
  dateCompleted?: Date;
  players: string[];
  give: string;
  image: string;
  icon: string;
}
