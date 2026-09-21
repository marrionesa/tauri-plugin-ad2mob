# tauri-plugin-ad2mob — rules applied when building this module standalone
# with minification. Rules that must survive into consuming apps live in
# consumer-rules.pro.

-keep class com.plugin.admob.** { *; }
-keepattributes RuntimeVisibleAnnotations,AnnotationDefault
