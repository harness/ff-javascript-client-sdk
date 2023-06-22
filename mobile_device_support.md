## Integration with web views on mobile devices

The SDK can be used inside webviews on native mobile apps for iOS and Android. You will need to add some additional
code to tell the SDK to update its local evaluations when the app comes to the foreground after being placed into
the background. This will ensure the SDK has the latest evaluations as the SSE stream will not receive events while
the app is suspended in the background. Similarly, you may want refresh the SDK if the network comes online after a
period of no connectivity.

The SDK provides a function on the client instance called `refreshEvaluations`. Calling this allows you to soft poll the
servers for the latest evaluations. Note to avoid overloading the backend servers this function will only call out to the
network after enough time has elapsed.

### toForeground JS function

Once you have a client instance (as shown above) add a function that can be easily invoked from the device's native language

```typescript
   function toForeground() {
      client.refreshEvaluations()
   }
```


### iOS

On iOS add an observer to wait for [willEnterForegroundNotification](https://developer.apple.com/documentation/uikit/uiapplication/1622944-willenterforegroundnotification) on the [WKWebView](https://developer.apple.com/documentation/webkit/wkwebview) to call [evaluateJavaScript()](https://developer.apple.com/documentation/webkit/wkwebview/1415017-evaluatejavascript)


```swift
  _ = NotificationCenter.default.addObserver(
      forName: UIApplication.willEnterForegroundNotification,
      object: nil,
      queue: .main
  ) { (notification: Notification) in

      if UIApplication.shared.applicationState == .background {

          // tell the embedded JS SDK to refresh itself
          getWebView().evaluateJavaScript("toForeground();") { (result, error) in
             ...
          }
      }
  }
```

### Android

On Android register an [ActivityLifecycleCallbacks](https://developer.android.com/reference/android/app/Application.ActivityLifecycleCallbacks) listener and override [onActivityStarted()](https://developer.android.com/reference/android/app/Application.ActivityLifecycleCallbacks#onActivityStarted(android.app.Activity)) (API level 29) then once a foreground event arrives you can call [evaluateJavascript()](https://developer.android.com/reference/android/webkit/WebView#evaluateJavascript(java.lang.String,%20android.webkit.ValueCallback%3Cjava.lang.String%3E)) on the [WebView](https://developer.android.com/reference/android/webkit/WebView)


```java
  @Override
  protected void onCreate(Bundle savedInstanceState) {
      super.onCreate(savedInstanceState);

      registerActivityLifecycleCallbacks(new Application.ActivityLifecycleCallbacks() {

          @Override
          public void onActivityStarted(@NonNull Activity activity) {
              WebView webView = findViewById(R.id.webview);
              // tell the embedded JS SDK to refresh itself
              webView.evaluateJavascript("toForeground();", (result) -> {
                  ...
              });
          }
      });
  }
```

