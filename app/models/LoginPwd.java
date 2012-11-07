package models;

import java.util.ArrayList;
import java.util.List;

public class LoginPwd {

	public String login;
	public String password;

	private static final List<LoginPwd> list = new ArrayList<LoginPwd>();

	public static List<LoginPwd> all() {
		return list;
	}

	public static void create(LoginPwd player) {
	}

}
