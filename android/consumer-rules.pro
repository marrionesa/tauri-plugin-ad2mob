# tauri-plugin-ad2mob — consumer ProGuard/R8 rules.
#
# These rules are applied to every app that consumes this library.
#
# The Tauri runtime resolves @Command methods reflectively and Jackson
# (de)serializes the @InvokeArg argument classes through reflection, so the
# whole plugin surface must survive minification in the consuming app.

-keep class com.plugin.admob.** { *; }
-keepattributes RuntimeVisibleAnnotations,AnnotationDefault

# The Google Mobile Ads and UMP artifacts ship their own consumer rules.
