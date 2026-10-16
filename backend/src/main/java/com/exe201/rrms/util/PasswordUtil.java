package com.exe201.rrms.util;
import javax.crypto.SecretKeyFactory; import javax.crypto.spec.PBEKeySpec; import java.security.*; import java.util.*;
public final class PasswordUtil {
 private PasswordUtil(){}
 public static String hash(String password){ try{ byte[] salt=new byte[16]; SecureRandom.getInstanceStrong().nextBytes(salt); int iter=120000; PBEKeySpec spec=new PBEKeySpec(password.toCharArray(),salt,iter,256); byte[] out=SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded(); return "pbkdf2$"+iter+"$"+Base64.getEncoder().encodeToString(salt)+"$"+Base64.getEncoder().encodeToString(out); }catch(Exception e){throw new IllegalStateException(e);} }
 public static boolean verify(String password,String stored){ if(stored==null) return false; if(!stored.startsWith("pbkdf2$")) return Objects.equals(password,stored); try{ String[] p=stored.split("\\$"); int iter=Integer.parseInt(p[1]); byte[] salt=Base64.getDecoder().decode(p[2]); byte[] expected=Base64.getDecoder().decode(p[3]); PBEKeySpec spec=new PBEKeySpec(password.toCharArray(),salt,iter,expected.length*8); byte[] actual=SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded(); return MessageDigest.isEqual(expected,actual); }catch(Exception e){return false;} }
}
