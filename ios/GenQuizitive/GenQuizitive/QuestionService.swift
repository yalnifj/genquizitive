//
//  QuestionService.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 2/20/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation

class Question {
    var name:String!
    var letter:String!
    var background:String!
    var difficulty:Int = 1
    var hints:[String]!
    var isReady = false
    var person:Person?
    var myTime:TimeInterval?
    var friendTime:TimeInterval?
    var myIncorrectCount:Int = 0
    var friendIncorrectCount:Int = 0
    
    var questionText:String!
    
    func setup(difficulty:Int, useLiving:Bool, onCompletion: @escaping (Question, Error?)->Void) {
        onCompletion(self, NSError(domain: "Question", code: 1, userInfo: ["message":"Setup method must be overridden in a subclass"]))
    }
}

class MultipleChoiceQuestion : Question {
    var answerPeople:[Person]!
}

class GenQuizRound {
    var questions:[Question]
    var myTotalTime:TimeInterval
    var friendTotalTime:TimeInterval
    var myTotalIncorrect:Int = 0
    var friendTotalIncorrect:Int = 0
    
    
    init(questions:[Question]) {
        self.questions = questions
        myTotalTime = 0
        friendTotalTime = 0
        for q in questions {
            if q.myTime != nil {
                myTotalTime += q.myTime!
            }
            if q.friendTime != nil {
                friendTotalTime += q.friendTime!
            }
            myTotalIncorrect += q.myIncorrectCount
            friendTotalIncorrect += q.friendIncorrectCount
        }
    }
}

class QuestionService {
 
    var questionTypes = ["photo1", "fact", "relationship", "timeline", "tree", "connect"]
    
    private static var instance:QuestionService?
    
    private init() {
        
    }
    
    static func getInstance() -> QuestionService {
        if instance == nil {
            instance = QuestionService()
        }
        return instance!
    }
    
    func getRandomQuestion() -> Question {
        let r = Int(arc4random_uniform(UInt32(self.questionTypes.count)))
        let questionType = questionTypes[r]
        
        var question:Question? = nil
        switch questionType {
            case "photo1":
                question = PhotoQuestion()
                break
            case "fact":
                question = FactQuestion()
                break
            case "relationship":
                question = RelationshipQuestion()
                break
            case "timeline":
                question = TimelineQuestion()
                break
            case "tree":
                question = TreeQuestion()
                break
            case "connect":
                question = ConnectQuestion()
                break
            default:
                break
        }
        return question!
    }
}
