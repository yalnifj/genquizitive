//
//  AuthDialogView.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 2/9/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation
import UIKit

protocol AuthCompleteListener {
    func AuthComplete(acessToken:String?)
    func AuthCanceled()
    func onAuthError(errorMessage:String)
}

class AuthDialogView : UIView, UIWebViewDelegate {
    
    @IBOutlet weak var webView: UIWebView!
    @IBOutlet weak var spinner: UIActivityIndicatorView!
    var view:UIView!
    
    var listener:AuthCompleteListener!
    
    var remoteService:RemoteService!
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setup()
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        setup()
    }
    
    func setup() {
        view = loadViewFromNib()
        view.frame = bounds
        view.autoresizingMask = UIViewAutoresizing.flexibleWidth
        addSubview(view)
        
        webView.delegate = self
        webView.isUserInteractionEnabled = true
        webView.scrollView.isScrollEnabled = true
    }
    
    func loadViewFromNib() -> UIView {
        let bundle = Bundle(for:type(of: self))
        let nib = UINib(nibName: "AuthDialogView", bundle: bundle)
        let view = nib.instantiate(withOwner: self, options: nil)[0] as! UIView
        
        return view
    }
    
    func startOAuth() {
        if remoteService != nil {
            let url = URL(string: remoteService!.oAuthUrl)
            if url != nil {
                let request = URLRequest(url: url!)
                webView.loadRequest(request)
            } else {
                print("invalid oauth url \(remoteService!.oAuthUrl)")
                if self.listener != nil {
                    self.listener!.onAuthError(errorMessage: "invalid oauth url \(remoteService!.oAuthUrl)")
                }
            }
        }
    }
    
    public func webView(_ webView: UIWebView, shouldStartLoadWith request: URLRequest, navigationType: UIWebViewNavigationType) -> Bool {
        //Sent before a web view begins loading a frame.
        print("before a web view begins loading a frame")
        UIApplication.shared.isNetworkActivityIndicatorVisible = false
        return true
    }
    
    public func webViewDidStartLoad(_ webView: UIWebView) {
        //Sent after a web view starts loading a frame.
        UIApplication.shared.isNetworkActivityIndicatorVisible = true
        spinner.isHidden = false
        spinner.startAnimating()
        print("starting to load:")
        print(webView.request!)
    }
    
    public func webViewDidFinishLoad(_ webView: UIWebView) {
        //Sent after a web view finishes loading a frame.
        UIApplication.shared.isNetworkActivityIndicatorVisible = false
        spinner.isHidden = true
        spinner.stopAnimating()
        
        print("finished loading")
        print(webView.request!)//Sent after a web view finishes loading a frame.
        UIApplication.shared.isNetworkActivityIndicatorVisible = false
        if webView.request!.url!.absoluteString != remoteService!.oAuthUrl && webView.request!.url!.absoluteString.contains(remoteService!.oAuthCompleteUrl) {
            remoteService?.processOathResponse(webview: webView, onCompletion: { accessToken, err in
                if err != nil {
                    print("error authenticating with remote service \(err)")
                    if self.listener != nil {
                        self.listener!.onAuthError(errorMessage: "Error authenticating with remote service \(err)")
                    }
                }
                if self.listener != nil {
                    self.listener!.AuthComplete(acessToken: accessToken)
                }
            })
        }
    }
    
    public func webView(_ webView: UIWebView, didFailLoadWithError error: Error){
        //Sent if a web view failed to load a frame.
        print("failed to load")
        print(error)
        if self.listener != nil {
            self.listener!.onAuthError(errorMessage: "Failed to load \(error)")
        }
    }
    
    @IBAction func cancelBtnClicked(_ sender: Any) {
        if listener != nil {
            listener!.AuthCanceled()
        }
    }
}
