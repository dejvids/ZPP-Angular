export class Participant {
    public StudentId: number;
    public LectureId: number;

    constructor(lectureId: number, studentId?: number) {
        this.LectureId = lectureId;
        this.StudentId = studentId;
    }
}
