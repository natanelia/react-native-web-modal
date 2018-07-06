import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StyleSheet,
} from 'react-native';

import ModalPortal from './Portal';

export default class Modal extends Component {
  static propTypes = {
    animationType: PropTypes.oneOf(['none', 'slide', 'fade']),
    transparent: PropTypes.bool,
    visible: PropTypes.bool,
    onRequestClose:
      Platform.isTV || Platform.OS === 'android'
        ? PropTypes.func.isRequired
        : PropTypes.func,
    onShow: PropTypes.func,
    onDismiss: PropTypes.func,
    children: PropTypes.node.isRequired,
  };

  static defaultProps = {
    animationType: 'none',
    transparent: false,
    visible: true,
    onShow: () => {},
    onRequestClose: () => {},
    onDismiss: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      animationSlide: null,
      animationFade: null,
      styleFade: { display: props.visible ? 'flex' : 'none' },
      opacityFade: new Animated.Value(0),
      slideTranslation: new Animated.Value(0),
    };
  }

  componentDidMount() {
    if (this.props.visible) this.handleShow();
  }

  componentWillReceiveProps({ visible }) {
    if (visible && !this.props.visible) this.handleShow();
    if (!visible && this.props.visible) this.handleClose();
  }

  handleShow() {
    const { animationType, onShow } = this.props;

    if (animationType === 'slide') {
      this.animateSlideIn(onShow);
    } else if (animationType === 'fade') {
      this.animateFadeIn(onShow);
    } else {
      onShow();
    }
  }

  handleClose() {
    const { animationType, onDismiss } = this.props;

    if (animationType === 'slide') {
      this.animateSlideOut(onDismiss);
    } else if (animationType === 'fade') {
      this.animateFadeOut(onDismiss);
    } else {
      onDismiss();
    }
  }

  // Fade Animation Implementation
  animateFadeIn = (callback) => {
    if (this.state.animationFade) {
      this.state.animationFade.stop();
    }

    const animationFade = Animated.timing(this.state.opacityFade, {
      toValue: 1,
      duration: 300,
    });

    this.setState(
      {
        animationFade,
      },
      () => {
        requestAnimationFrame(() => {
          this.setState({ styleFade: { display: 'flex' } }, () =>
            this.state.animationFade.start(callback)
          );
        });
      }
    );
  };

  animateFadeOut = (callback) => {
    if (this.state.animationFade) {
      this.state.animationFade.stop();
    }

    const animationFade = Animated.timing(this.state.opacityFade, {
      toValue: 0,
      duration: 300,
    });

    this.setState(
      {
        animationFade,
      },
      () => {
        requestAnimationFrame(() => {
          this.state.animationFade.start(() => {
            this.setState(
              {
                styleFade: { display: 'none' },
              },
              callback
            );
          });
        });
      }
    );
  };
  // End of Fade Animation Implementation

  // Slide Animation Implementation
  animateSlideIn = (callback) => {
    if (this.state.animationSlide) {
      this.state.animationSlide.stop();
    }

    const animationSlide = Animated.timing(this.state.slideTranslation, {
      toValue: 1,
      easing: Easing.out(Easing.poly(4)),
      duration: 300,
    });

    this.setState(
      {
        animationSlide,
      },
      () => {
        requestAnimationFrame(() => {
          this.setState({ styleFade: { display: 'flex' } }, () =>
            this.state.animationSlide.start(callback)
          );
        });
      }
    );
  };

  animateSlideOut = (callback) => {
    if (this.state.animationSlide) {
      this.state.animationSlide.stop();
    }

    const animationSlide = Animated.timing(this.state.slideTranslation, {
      toValue: 0,
      easing: Easing.in(Easing.poly(4)),
      duration: 300,
    });

    this.setState(
      {
        animationSlide,
      },
      () => {
        requestAnimationFrame(() => {
          this.state.animationSlide.start(() => {
            this.setState(
              {
                styleFade: { display: 'none' },
              },
              callback
            );
          });
        });
      }
    );
  };
  // End of Slide Animation Implementation

  getAnimationStyle() {
    const { visible, animationType } = this.props;
    const { styleFade } = this.state;

    if (animationType === 'slide') {
      return [
        {
          transform: [
            {
              translateY: this.state.slideTranslation.interpolate({
                inputRange: [0, 1],
                outputRange: [Dimensions.get('window').height, 0],
                extrapolate: 'clamp',
              }),
            },
          ],
        },
        styleFade,
      ];
    }
    if (animationType === 'fade') {
      return [{ opacity: this.state.opacityFade }, styleFade];
    }

    return [style[visible ? 'visible' : 'hidden']];
  }

  render() {
    const { transparent, children } = this.props;

    const transparentStyle = transparent
      ? style.bgTransparent
      : style.bgNotTransparent;
    const animationStyle = this.getAnimationStyle();

    return (
      <ModalPortal>
        <Animated.View
          style={[style.baseStyle, transparentStyle, animationStyle]}
        >
          {children}
        </Animated.View>
      </ModalPortal>
    );
  }
}

const style = StyleSheet.create({
  baseStyle: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 9999,
  },
  bgTransparent: {
    backgroundColor: 'transparent',
  },
  bgNotTransparent: {
    backgroundColor: '#ffffff',
  },
  hidden: {
    display: 'none',
  },
  visible: {
    display: 'flex',
  },
});