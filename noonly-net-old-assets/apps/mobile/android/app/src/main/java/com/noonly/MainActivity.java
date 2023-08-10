package com.noonly;

import com.facebook.react.ReactActivity;
import android.os.Bundle;
import com.rnimmersivebars.ImmersiveBars;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "Noonly";
  }

  /* https://reactnavigation.org/docs/getting-started/ */
  /* https://github.com/oceanbit/react-native-immersive-bars */
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    boolean isDarkMode = false;
    ImmersiveBars.changeBarColors(this, isDarkMode);
    super.onCreate(savedInstanceState);
  }
}
