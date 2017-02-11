//
//  FacebookService.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 2/7/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation
import FacebookCore
import FacebookLogin

class FacebookService {
    
    class FacebookUser {
        var name:String!
        var id:String!
        var picture:String!
        
        init(data:[String : Any]) {
            self.name = data["name"] as! String
            self.id = data["id"] as! String
            let picture = data["picture"] as? NSDictionary
            if picture != nil {
                let pictureData = picture?["data"] as? NSDictionary
                if pictureData != nil {
                    let sil = pictureData?["is_silhouette"] as! Bool
                    if !sil {
                        self.picture = pictureData?["url"] as! String
                    }
                }
            }
        }
    }
    
    private static var instance:FacebookService?
    
    private var fsUser:FacebookUser?
    
    private init() {
        
    }
    
    static func getInstance() -> FacebookService {
        if instance == nil {
            instance = FacebookService()
        }
        
        return instance!
    }
    
    func isAuthenticated() -> Bool {
        if AccessToken.current != nil {
            return true
        } else {
            return false
        }
    }

    func getCurrentUser(onCompletion: @escaping (FacebookUser?, Error?) -> Void) {
        if (self.fsUser != nil) {
            onCompletion(self.fsUser, nil)
            return
        }
        let connection = GraphRequestConnection()
        connection.add(GraphRequest(graphPath: "/me", parameters: ["fields":"id, name, picture"])) { httpResponse, result in
            switch result {
            case .success(let response):
                print("Graph Request Succeeded: \(response)")
                self.fsUser = FacebookUser(data: response.dictionaryValue!)
                onCompletion(self.fsUser, nil)
            case .failed(let error):
                print("Graph Request Failed: \(error)")
                onCompletion(nil, error)
            }
        }
        connection.start()
    }
    
    func getUserById(id:String, onCompletion: @escaping (FacebookUser?, Error?) -> Void) {
        let connection = GraphRequestConnection()
        connection.add(GraphRequest(graphPath: "/\(id)", parameters: ["fields":"id, name, picture"])) { httpResponse, result in
            switch result {
            case .success(let response):
                print("Graph Request Succeeded: \(response)")
                let user = FacebookUser(data: response.dictionaryValue!)
                onCompletion(user, nil)
            case .failed(let error):
                print("Graph Request Failed: \(error)")
                onCompletion(nil, error)
            }
        }
        connection.start()

    }
    
    func getGenquizitiveFriends(onCompletion: @escaping ([FacebookUser]?, Error?)->Void) {
        let connection = GraphRequestConnection()
        connection.add(GraphRequest(graphPath: "/me/friends", parameters: ["fields":"id, name, picture"])) { httpResponse, result in
            switch result {
            case .success(let response):
                print("Graph Request Succeeded")
                var friends = [FacebookUser]()
                if response.arrayValue != nil {
                    for friendData in response.arrayValue! {
                        let friend = FacebookUser(data: friendData as! [String : Any])
                        friends.append(friend)
                    }
                }
                onCompletion(friends, nil)
            case .failed(let error):
                print("Graph Request Failed: \(error)")
                onCompletion(nil, error)
            }
        }
        connection.start()
    }
}
