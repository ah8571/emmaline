const { withMainApplication, createRunOncePlugin } = require('@expo/config-plugins');

function addImport(src, statement) {
  if (src.includes(statement)) {
    return src;
  }

  return src.replace(/^(package\s+[\w.]+\s*\n)/m, `$1\n${statement}\n`);
}

function addJavaField(src) {
  if (src.includes('VoiceApplicationProxy voiceApplicationProxy')) {
    return src;
  }

  return src.replace(
    /(public class MainApplication[^\{]*\{\n)/m,
    `$1  private final VoiceApplicationProxy voiceApplicationProxy = new VoiceApplicationProxy(this);\n`
  );
}

function addJavaOnCreateCall(src) {
  if (src.includes('voiceApplicationProxy.onCreate();')) {
    return src;
  }

  return src.replace('super.onCreate();', 'super.onCreate();\n    voiceApplicationProxy.onCreate();');
}

function addJavaOnTerminate(src) {
  if (src.includes('public void onTerminate()')) {
    return src;
  }

  const method = [
    '',
    '  @Override',
    '  public void onTerminate() {',
    '    voiceApplicationProxy.onTerminate();',
    '    super.onTerminate();',
    '  }',
  ].join('\n');

  return src.replace(/}\s*$/, `${method}\n}`);
}

function addKotlinField(src) {
  if (src.includes('private val voiceApplicationProxy = VoiceApplicationProxy(this)')) {
    return src;
  }

  return src.replace(
    /(class MainApplication[^\{]*\{\n)/m,
    `$1  private val voiceApplicationProxy = VoiceApplicationProxy(this)\n`
  );
}

function addKotlinOnCreateCall(src) {
  if (src.includes('voiceApplicationProxy.onCreate()')) {
    return src;
  }

  return src.replace('super.onCreate()', 'super.onCreate()\n    voiceApplicationProxy.onCreate()');
}

function addKotlinOnTerminate(src) {
  if (src.includes('override fun onTerminate()')) {
    return src;
  }

  const method = [
    '',
    '  override fun onTerminate() {',
    '    voiceApplicationProxy.onTerminate()',
    '    super.onTerminate()',
    '  }',
  ].join('\n');

  return src.replace(/}\s*$/, `${method}\n}`);
}

function withTwilioVoiceApplicationProxy(config) {
  return withMainApplication(config, (mod) => {
    let src = mod.modResults.contents;

    if (mod.modResults.language === 'java') {
      src = addImport(src, 'import com.twiliovoicereactnative.VoiceApplicationProxy;');
      src = addJavaField(src);
      src = addJavaOnCreateCall(src);
      src = addJavaOnTerminate(src);
    } else if (mod.modResults.language === 'kt') {
      src = addImport(src, 'import com.twiliovoicereactnative.VoiceApplicationProxy');
      src = addKotlinField(src);
      src = addKotlinOnCreateCall(src);
      src = addKotlinOnTerminate(src);
    }

    mod.modResults.contents = src;
    return mod;
  });
}

module.exports = createRunOncePlugin(
  withTwilioVoiceApplicationProxy,
  'with-twilio-voice-application-proxy',
  '1.0.0'
);
