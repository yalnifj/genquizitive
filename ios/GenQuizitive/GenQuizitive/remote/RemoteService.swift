import Foundation
import UIKit

typealias ServiceResponse = (JSON, NSError?) -> Void
typealias AcessTokenResponse = (String?, NSError?) -> Void
typealias PersonResponse = (Person?, NSError?) -> Void
typealias LinkResponse = (Link?, NSError?) -> Void
typealias RelationshipsResponse = ([Relationship]?, NSError?) -> Void
typealias SourceDescriptionsResponse = ([SourceDescription]?, NSError?) -> Void
typealias StringResponse = (String?, NSError?) -> Void
typealias LongResponse = (Int64?, NSError?) -> Void

protocol RemoteService {
	var sessionId: String? { get set }
    var oAuthUrl: String { get }
    var oAuthCompleteUrl: String { get }
    func processOathResponse(webview:UIWebView, onCompletion: @escaping AcessTokenResponse)
	func getCurrentPerson(_ onCompletion: @escaping PersonResponse)
    func getPerson(_ personId: String, ignoreCache: Bool, onCompletion: @escaping PersonResponse)
	func getLastChangeForPerson(_ personId: String, onCompletion: @escaping LongResponse)
	func getPersonPortrait(_ personId: String, onCompletion: @escaping LinkResponse)
	func getCloseRelatives(_ personId: String, onCompletion: @escaping RelationshipsResponse)
	func getParents(_ personId: String, onCompletion: @escaping RelationshipsResponse)
	func getChildren(_ personId: String, onCompletion: @escaping RelationshipsResponse)
	func getSpouses(_ personId: String, onCompletion: @escaping RelationshipsResponse)
    func getAncestorTree(personId: String, generations: Int, details:Bool, spouse:String?, noCache:Bool, onCompletion: @escaping ([Person]?, NSError?) -> Void)
    func getDescendancyTree(personId: String, generations: Int, details:Bool, spouse:String?, noCache:Bool, onCompletion: @escaping ([Person]?, NSError?) -> Void)
	func getPersonMemories(_ personId: String, onCompletion: @escaping SourceDescriptionsResponse)
	func downloadImage(_ uri: String, folderName: String, fileName: String, onCompletion: @escaping StringResponse)
	func getPersonUrl(_ personId: String) -> String
}

protocol LoginCompleteListener {
    func LoginComplete()
    func LoginCanceled()
}
