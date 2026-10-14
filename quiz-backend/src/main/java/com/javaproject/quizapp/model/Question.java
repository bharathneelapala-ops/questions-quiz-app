package com.javaproject.quizapp.model;

import jakarta.persistence.*;
import jdk.jfr.TransitionFrom;
import lombok.Data;

@Data
@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "question_seq_generator"
    )
    @SequenceGenerator(
            name = "question_seq_generator",
            sequenceName = "question_seq",
            allocationSize = 1
    )
    private Integer id;

    @Column(name = "question_title")
    private String questionTitle;

    private String option1;

    private String option2;

    private String option3;

    private String option4;

    private String rightAnswer;

    private String difficultylevel;

    private String category;

}
