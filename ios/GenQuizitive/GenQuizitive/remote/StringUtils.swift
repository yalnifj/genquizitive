//
//  StringUtils.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 2/13/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation

class StringUtils {
    static func split(text:String, splitter: String) -> Array<String> {
        let regEx = try? NSRegularExpression(pattern: splitter, options: [])
        let stop = "-=-=-"
        let modifiedString = regEx!.stringByReplacingMatches(in: text, options: NSRegularExpression.MatchingOptions(),
                                                             range: NSMakeRange(0, text.characters.count),
                                                             withTemplate:stop)
        return modifiedString.components(separatedBy: stop)
    }

    static func replaceAll(text:String, regex:String, replace:String) -> String {
        let regEx = try? NSRegularExpression(pattern: regex, options: [])
        let modifiedString = regEx!.stringByReplacingMatches(in: text, options: NSRegularExpression.MatchingOptions(),
                                                             range: NSMakeRange(0, text.characters.count),
                                                             withTemplate:replace)
        return modifiedString
    }
}
