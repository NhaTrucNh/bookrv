/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import classNames from 'classnames/bind';
import styles from './Register.module.scss';
import logo from '../../asset/images/Logo.png';

const cx = classNames.bind(styles);

export default class Register extends React.Component {
    render() {
        return (
            <div className={cx('wrapper')}>
                <div className={cx('inner')}>
                    <div className={cx('logo')}>
                        <img src={logo} />
                    </div>
                    <div className={cx('form')}>
                        <input type="email" placeholder="Nhập email" spellCheck={false} />
                    </div>
                    <div className={cx('form')}>
                        <input type="password" placeholder="Nhập mật khẩu" spellCheck={false} />
                    </div>

                    <div className={cx('submit')}>
                        <button>Đăng ký</button>
                    </div>
                    <p>
                        Đã có tài khoản ? <a href="../login">Đăng nhập</a>
                    </p>
                </div>
            </div>
        );
    }
}
