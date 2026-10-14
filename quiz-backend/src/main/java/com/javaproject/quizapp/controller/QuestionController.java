package com.javaproject.quizapp.controller;


import com.javaproject.quizapp.model.Question;
import com.javaproject.quizapp.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("question")
public class QuestionController {

    @Autowired
    public QuestionService questionService;

//    public QuestionController(QuestionService questionservice){
//        this.questionService = questionservice;
//    }

    @GetMapping("allQuestions")
    public ResponseEntity<List<Question>> getAllquestions(){
        return questionService.getAllQuestions();
    }

    @GetMapping("category/{Category}")
    public ResponseEntity<List<Question>> getQuestionByCategory(@PathVariable("Category") String category){
        return questionService.getQuestionsByCategory(category);
    }

    @PostMapping("add")
    public ResponseEntity<String> addQuestion(@RequestBody Question question){
        return questionService.addQuestion(question);
    }

    @DeleteMapping("delete/{id}")
    public void deleteQuestion(@PathVariable("id") int id){
        questionService.deleteById(id);
//        return "deleted successfully";
    }
}
